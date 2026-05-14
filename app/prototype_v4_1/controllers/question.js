const { nhsukDate } = require('../../filters/dates')
const {
  getQuestion,
  getQuestionValueLabels,
  smokingChangeTypes,
  shishaSmokingSettings,
  tobaccoTypes: smokingTypes
} = require('../lib/questions')
const { validateQuestion } = require('../lib/validate-question')

const version = 'v4_1'

/**
 * @typedef {Object} ActionLinks
 * @property {string} next - Form post URL.
 * @property {string} [back] - Back link URL.
 * @property {string} [cancel] - Cancel link URL.
 * @property {string} [switchUnits] - Optional unit-switch URL.
 * @property {string} [onward] - Redirect URL after a successful post.
 */

/**
 * @typedef {Object} SmokingTypeStep
 * @property {string} page - Route/page id for the step.
 * @property {string} type - Tobacco type key, for example cigarettes.
 * @property {string} [setting] - Shisha setting key.
 * @property {string} [change] - Smoking change key.
 */

/**
 * @typedef {Object} SummaryRow
 * @property {Object} key - NHS summary-list key config.
 * @property {Object} [value] - NHS summary-list value config.
 * @property {Object} actions - NHS summary-list actions config.
 */

/**
 * Build a prototype v4_1 view path.
 *
 * @param {string} template - Template path below the prototype views folder.
 * @returns {string} Nunjucks template path.
 */
const view = (template) => {
  return `prototype_${version}/views/${template}`
}

/**
 * Render a YAML-backed question using optional runtime overrides.
 *
 * @param {Object} res - Express response object.
 * @param {string} id - Question id from questions.yaml.
 * @param {ActionLinks} actions - URLs used by the generic question template.
 * @param {Object[]} [errors] - Validation errors for the question.
 * @param {Object} [overrides] - Runtime overrides for dynamic question content.
 */
const renderQuestion = (res, id, actions, errors = [], overrides = {}) => {
  const question = getQuestion(id)
  const errorMap = errors.reduce((map, error) => {
    if (error.href) {
      map[error.href.replace('#', '')] = error
    }

    return map
  }, {})

  res.render(view('questions/_question'), {
    question: {
      ...question,
      ...overrides,
      heading: {
        ...question.heading,
        ...overrides.heading
      },
      input: {
        ...question.input,
        ...overrides.input
      }
    },
    errorMap,
    errors,
    actions
  })
}

/**
 * Resolve the back link for weight pages based on the height unit answered.
 *
 * @param {Object} req - Express request object.
 * @returns {string} Back link URL.
 */
const getHeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.height?.imperial ? `/prototype_${version}/height-imperial` : `/prototype_${version}/height-metric`
}

/**
 * Resolve the back link after weight pages based on the weight unit answered.
 *
 * @param {Object} req - Express request object.
 * @returns {string} Back link URL.
 */
const getWeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.weight?.imperial ? `/prototype_${version}/weight-imperial` : `/prototype_${version}/weight-metric`
}

/**
 * Resolve the next weight page after height, preserving an existing unit choice.
 *
 * @param {Object} req - Express request object.
 * @param {string} defaultUnit - Unit to use when no weight unit has been chosen.
 * @returns {string} Next weight page URL.
 */
const getWeightNext = (req, defaultUnit) => {
  const { answers } = req.session.data

  if (answers?.weight?.imperial) {
    return `/prototype_${version}/weight-imperial`
  }

  if (answers?.weight?.metric) {
    return `/prototype_${version}/weight-metric`
  }

  return `/prototype_${version}/weight-${defaultUnit}`
}

/**
 * Convert date-of-birth answer parts into a Date object.
 *
 * @param {Object} answers - Session answers object.
 * @returns {Date|boolean} Date of birth, or false when the parts are invalid.
 */
const getDateOfBirth = (answers) => {
  const day = Number(answers?.dateOfBirth?.day)
  const month = Number(answers?.dateOfBirth?.month)
  const year = Number(answers?.dateOfBirth?.year)

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false
  }

  return date
}

/**
 * Calculate an age in years from a Date.
 *
 * @param {Date} dateOfBirth - Date of birth.
 * @returns {number} Age in years.
 */
const getAge = (dateOfBirth) => {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Check whether a person is in the scan-eligible age range.
 *
 * @param {Date} dateOfBirth - Date of birth.
 * @returns {boolean} True when age is between 55 and 74 inclusive.
 */
const isEligibleForScanAge = (dateOfBirth) => {
  const age = getAge(dateOfBirth)

  return age >= 55 && age <= 74
}

const nextStepAfterSmokingTypes = `/prototype_${version}/check-your-answers`

/**
 * Get selected tobacco types in tobacco.yaml order.
 *
 * @param {Object} answers - Session answers object.
 * @returns {string[]} Selected tobacco type keys.
 */
const getSelectedSmokingTypes = (answers = {}) => {
  const selectedTypes = Array.isArray(answers.smokingType)
    ? answers.smokingType
    : [answers.smokingType].filter(Boolean)

  return Object.keys(smokingTypes).filter((type) => selectedTypes.includes(type))
}

/**
 * Remove nested answers for tobacco types the user has unselected.
 *
 * @param {Object} answers - Session answers object, mutated in place.
 */
const deleteUnselectedSmokingTypeAnswers = (answers = {}) => {
  const selectedTypes = getSelectedSmokingTypes(answers)

  Object.keys(smokingTypes).forEach((type) => {
    if (!selectedTypes.includes(type)) {
      delete answers[type]
    }
  })
}

/**
 * Get selected smoking change options in tobacco.yaml order.
 *
 * @param {Object} answer - Answer object for one tobacco type.
 * @returns {string[]} Selected smoking change keys.
 */
const getSelectedSmokingChanges = (answer = {}) => {
  const selectedChanges = Array.isArray(answer.smokingChange)
    ? answer.smokingChange
    : [answer.smokingChange].filter(Boolean)

  return Object.keys(smokingChangeTypes).filter((change) => selectedChanges.includes(change))
}

/**
 * Remove nested changed-smoking answers for unselected change options.
 *
 * @param {Object} answer - Answer object for one tobacco type, mutated in place.
 */
const deleteUnselectedSmokingChangeAnswers = (answer = {}) => {
  const selectedChanges = getSelectedSmokingChanges(answer)

  Object.entries(smokingChangeTypes).forEach(([change, changeType]) => {
    if (!selectedChanges.includes(change)) {
      delete answer[changeType.answerKey]
    }
  })
}

/**
 * Get selected shisha settings in tobacco.yaml order.
 *
 * @param {Object} answer - Shisha answer object.
 * @returns {string[]} Selected shisha setting keys.
 */
const getSelectedShishaSettings = (answer = {}) => {
  const selectedSettings = Array.isArray(answer.smokingSetting)
    ? answer.smokingSetting
    : [answer.smokingSetting].filter(Boolean)

  return Object.keys(shishaSmokingSettings).filter((setting) => selectedSettings.includes(setting))
}

/**
 * Remove nested shisha answers for unselected settings.
 *
 * @param {Object} answer - Shisha answer object, mutated in place.
 */
const deleteUnselectedShishaSettingAnswers = (answer = {}) => {
  const selectedSettings = getSelectedShishaSettings(answer)

  Object.keys(shishaSmokingSettings).forEach((setting) => {
    if (!selectedSettings.includes(setting)) {
      delete answer[setting]
    }
  })
}

/**
 * Build the tobacco sub-flow steps from selected tobacco answers.
 *
 * @param {Object} answers - Session answers object.
 * @returns {SmokingTypeStep[]} Ordered tobacco sub-flow steps.
 */
const getSmokingTypeSteps = (answers = {}) => {
  const includeSmokingStatus = answers.smoker !== 'yes_previous'

  return getSelectedSmokingTypes(answers).flatMap((type) => {
    const steps = []
    const answer = answers[type] || {}

    if (includeSmokingStatus) {
      steps.push({ page: 'smoking-status', type })
    }

    if (type === 'shisha') {
      steps.push({ page: 'smoking-setting', type })
      getSelectedShishaSettings(answer).forEach((setting) => {
        steps.push({ page: 'smoking-frequency', type, setting })
        steps.push({ page: 'smoking-quantity', type, setting })
      })
    } else {
      steps.push({ page: 'smoking-frequency', type })
      steps.push({ page: 'smoking-quantity', type })
      steps.push({ page: 'smoking-change', type })
      getSelectedSmokingChanges(answer).forEach((change) => {
        steps.push({ page: 'smoking-frequency-change', type, change })
        steps.push({ page: 'smoking-quantity-change', type, change })
        steps.push({ page: 'smoking-years-change', type, change })
      })
    }

    return steps
  })
}

/**
 * Build a URL for a tobacco sub-flow step.
 *
 * @param {SmokingTypeStep} step - Tobacco sub-flow step.
 * @returns {string} Step URL including query parameters.
 */
const getSmokingTypeStepUrl = (step) => {
  const searchParams = new URLSearchParams({ type: step.type })

  if (step.change) {
    searchParams.set('change', step.change)
  }

  if (step.setting) {
    searchParams.set('setting', step.setting)
  }

  return `/prototype_${version}/${step.page}?${searchParams}`
}

/**
 * Format a date of birth for check-your-answers.
 *
 * @param {Object} dateOfBirth - Date parts keyed by day, month and year.
 * @returns {string} Formatted date, or an empty string when incomplete.
 */
const formatDateOfBirth = (dateOfBirth = {}) => {
  if (!dateOfBirth.day || !dateOfBirth.month || !dateOfBirth.year) {
    return ''
  }

  return nhsukDate(
    `${dateOfBirth.year}-${String(dateOfBirth.month).padStart(2, '0')}-${String(dateOfBirth.day).padStart(2, '0')}`
  )
}

/**
 * Format a height answer for check-your-answers.
 *
 * @param {Object} height - Height answer object.
 * @returns {string} Formatted height.
 */
const formatHeight = (height = {}) => {
  if (height.metric) {
    return `${height.metric} cm`
  }

  if (height.imperial?.feet || height.imperial?.inches) {
    return `${height.imperial.feet || 0} feet ${height.imperial.inches || 0} inches`
  }

  return ''
}

/**
 * Format a weight answer for check-your-answers.
 *
 * @param {Object} weight - Weight answer object.
 * @returns {string} Formatted weight.
 */
const formatWeight = (weight = {}) => {
  if (weight.metric) {
    return `${weight.metric} kg`
  }

  if (weight.imperial?.stones || weight.imperial?.pounds) {
    return `${weight.imperial.stones || 0} stone ${weight.imperial.pounds || 0} pounds`
  }

  return ''
}

const valueLabels = {
  asbestosAtHome: getQuestionValueLabels('asbestos-at-home'),
  asbestosAtWork: getQuestionValueLabels('asbestos-at-work'),
  cancerDiagnosis: getQuestionValueLabels('cancer-diagnosis'),
  cancerDiagnosisRelatives: getQuestionValueLabels('cancer-diagnosis-relatives'),
  cancerDiagnosisRelativesAge: getQuestionValueLabels('cancer-diagnosis-relatives-age'),
  education: getQuestionValueLabels('education'),
  ethnicity: getQuestionValueLabels('ethnicity'),
  faceToFaceAppointment: getQuestionValueLabels('face-to-face-appointment'),
  gender: getQuestionValueLabels('gender'),
  periodsStoppedSmoking: {
    yes: 'Yes',
    no: 'No'
  },
  respiratoryConditions: getQuestionValueLabels('respiratory-conditions'),
  sex: getQuestionValueLabels('sex'),
  smoker: getQuestionValueLabels('smoker'),
  smokingChange: getQuestionValueLabels('smoking-change'),
  smokingFrequency: getQuestionValueLabels('smoking-frequency'),
  smokingStatus: getQuestionValueLabels('smoking-status'),
  smokingQuantityRollingTobacco: getQuestionValueLabels('smoking-quantity'),
  smokingSetting: getQuestionValueLabels('smoking-setting'),
  smokingType: getQuestionValueLabels('smoking-type')
}

/**
 * Format one or more stored values using display labels.
 *
 * @param {string|string[]} value - Submitted value or values.
 * @param {Object.<string, string>} labels - Value-to-label map.
 * @returns {string} Comma-separated display labels.
 */
const formatValue = (value, labels) => {
  if (!value) {
    return ''
  }

  const values = Array.isArray(value) ? value : [value]

  return values.map((item) => labels?.[item] || item).join(', ')
}

/**
 * Build an NHS summary-list row.
 *
 * @param {Object} row - Row config.
 * @param {string} row.key - Question text.
 * @param {string} [row.value] - Plain text answer value.
 * @param {string} [row.html] - HTML answer value.
 * @param {string} row.href - Change link URL.
 * @param {string} [row.visuallyHiddenText] - Custom visually hidden action text.
 * @returns {SummaryRow|boolean} Summary row, or false when there is no value.
 */
const makeSummaryRow = ({ key, value, html, href, visuallyHiddenText }) => {
  if (!value && !html) {
    return false
  }

  return {
    key: {
      text: key
    },
    value: html
      ? { html }
      : { text: value },
    actions: {
      items: [
        {
          href,
          text: 'Change',
          visuallyHiddenText: visuallyHiddenText || key
        }
      ]
    }
  }
}

/**
 * Remove empty rows from a summary-list row collection.
 *
 * @param {Array<SummaryRow|boolean>} rows - Summary rows.
 * @returns {SummaryRow[]} Visible rows.
 */
const makeSummaryRows = (rows) => rows.filter(Boolean)

/**
 * Format a numeric quantity with singular or plural unit text.
 *
 * @param {string|number} value - Numeric value.
 * @param {string} singular - Singular unit.
 * @param {string} plural - Plural unit.
 * @returns {string} Formatted quantity.
 */
const formatQuantity = (value, singular, plural) => {
  return `${value} ${Number(value) === 1 ? singular : plural}`
}

/**
 * Escape HTML before manually building a summary-list HTML value.
 *
 * @param {*} value - Value to escape.
 * @returns {string} Escaped HTML string.
 */
const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Format a tobacco quantity answer with the correct unit label.
 *
 * @param {string} type - Tobacco type key.
 * @param {string} answer - Submitted quantity answer.
 * @returns {string} Display quantity.
 */
const getSmokingQuantity = (type, answer) => {
  if (!answer) {
    return ''
  }

  if (type === 'rolling_tobacco') {
    return valueLabels.smokingQuantityRollingTobacco[answer] || answer
  }

  const smokingType = smokingTypes[type]
  return smokingType?.suffix
    ? formatQuantity(answer, smokingType.singularSuffix || smokingType.suffix, smokingType.suffix)
    : answer
}

/**
 * Format rolling tobacco boundary values for "more/fewer than" comparisons.
 *
 * @param {string} answer - Submitted rolling tobacco quantity.
 * @returns {string} Quantity text for comparison labels.
 */
const getRollingTobaccoComparisonQuantity = (answer) => {
  const comparisonQuantities = {
    less_than_10: '10g',
    more_than_100: '100g'
  }

  return comparisonQuantities[answer] || getSmokingQuantity('rolling_tobacco', answer)
}

/**
 * Format a tobacco quantity for changed-smoking comparison text.
 *
 * @param {string} type - Tobacco type key.
 * @param {string} answer - Submitted quantity answer.
 * @returns {string} Quantity text for comparison labels.
 */
const getSmokingComparisonQuantity = (type, answer) => {
  if (type === 'rolling_tobacco') {
    return getRollingTobaccoComparisonQuantity(answer)
  }

  return getSmokingQuantity(type, answer)
}

const smokingFrequencyPeriods = {
  daily: 'a day',
  weekly: 'a week',
  monthly: 'a month',
  yearly: 'a year'
}

/**
 * Convert a smoking frequency value into a period phrase.
 *
 * @param {string} frequency - Frequency value.
 * @returns {string} Period phrase, for example `a day`.
 */
const getSmokingFrequencyPeriod = (frequency) => {
  return smokingFrequencyPeriods[frequency] || ''
}

/**
 * Replace the default "normal day/week/month/year" phrase in a heading.
 *
 * @param {string} heading - Heading text from YAML.
 * @param {string} frequency - Selected smoking frequency.
 * @returns {string} Heading with the selected frequency period.
 */
const applySmokingFrequencyPeriod = (heading = '', frequency) => {
  const period = getSmokingFrequencyPeriod(frequency)

  if (!period) {
    return heading
  }

  return heading.replace(/in a normal (day|week|month|year)/, `in a normal ${period.replace(/^a /, '')}`)
}

/**
 * Build the current amount phrase used in changed-smoking labels.
 *
 * @param {string} type - Tobacco type key.
 * @param {Object} answer - Answer object for one tobacco type.
 * @returns {string} Amount phrase, for example `10 cigarettes a day`.
 */
const getSmokingCurrentAmount = (type, answer = {}) => {
  const quantity = getSmokingComparisonQuantity(type, answer.smokingQuantity)
  const period = getSmokingFrequencyPeriod(answer.smokingFrequency)

  if (!quantity) {
    return ''
  }

  return [quantity, period].filter(Boolean).join(' ')
}

/**
 * Decide whether a tobacco type should use past-tense content.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} answer - Answer object for one tobacco type.
 * @returns {boolean} True when past-tense headings should be used.
 */
const isPastSmokingType = (answers = {}, answer = {}) => {
  return answers.smoker === 'yes_previous' || answer.smokingStatus === 'no'
}

/**
 * Build contextual labels for the smoking-change checkbox options.
 *
 * @param {string} type - Tobacco type key.
 * @param {Object} answer - Answer object for one tobacco type.
 * @param {boolean} isPast - Whether past-tense labels should be used.
 * @returns {Object.<string, string>} Value-to-label map.
 */
const getSmokingChangeLabels = (type, answer = {}, isPast = false) => {
  const amount = getSmokingCurrentAmount(type, answer)
  const fewerLabel = type === 'rolling_tobacco' ? 'less' : 'fewer'
  const defaultLabels = isPast
    ? {
        greater: 'Yes, I smoked more',
        fewer: `Yes, I smoked ${fewerLabel}`,
        no: 'No, it did not change'
      }
    : valueLabels.smokingChange

  if (!amount) {
    return defaultLabels
  }

  return {
    ...defaultLabels,
    greater: `Yes, I ${isPast ? 'smoked' : 'used to smoke'} more than ${amount}`,
    fewer: `Yes, I ${isPast ? 'smoked' : 'used to smoke'} ${fewerLabel} than ${amount}`
  }
}

/**
 * Get the nested answer object for a shisha setting.
 *
 * @param {Object} answer - Shisha answer object.
 * @param {string} setting - Shisha setting key.
 * @returns {Object} Setting-specific answer object.
 */
const getShishaSettingAnswer = (answer = {}, setting) => {
  return setting ? answer[setting] || {} : {}
}

/**
 * Get tobacco type content with the right tense-specific heading aliases.
 *
 * @param {string} type - Tobacco type key.
 * @param {boolean} isPast - Whether past-tense headings should be used.
 * @returns {Object} Tobacco type content.
 */
const getSmokingTypeHeadings = (type, isPast = false) => {
  const smokingType = smokingTypes[type]

  if (!smokingType) {
    return {}
  }

  const currentHeadings = smokingType.headings?.current || {}
  const tenseHeadings = smokingType.headings?.[isPast ? 'past' : 'current'] || currentHeadings

  return {
    ...smokingType,
    statusHeading: currentHeadings.status,
    frequencyHeading: tenseHeadings.frequency,
    quantityHeading: tenseHeadings.quantity,
    changeHeading: tenseHeadings.change,
    settingHeading: tenseHeadings.setting
  }
}

/**
 * Get the heading for a tobacco sub-flow step.
 *
 * @param {string} page - Step page id.
 * @param {string} type - Tobacco type key.
 * @param {string} setting - Optional shisha setting key.
 * @param {boolean} isPast - Whether past-tense headings should be used.
 * @param {Object} answer - Answer object used for frequency-specific periods.
 * @returns {string} Step heading.
 */
const getSmokingStepHeading = (page, type, setting, isPast = false, answer = {}) => {
  const smokingType = smokingTypes[type]
  const frequency = answer.smokingFrequency

  if (!smokingType) {
    return ''
  }

  if (type === 'shisha' && setting) {
    const tense = isPast ? 'past' : 'current'
    const settingHeadings = smokingType.settingHeadings?.[setting]?.[tense]

    if (settingHeadings) {
      return applySmokingFrequencyPeriod(settingHeadings[page.replace('smoking-', '')] || '', frequency)
    }
  }

  return applySmokingFrequencyPeriod(getSmokingTypeHeadings(type, isPast)[`${page.replace('smoking-', '')}Heading`] || '', frequency)
}

/**
 * Get the nested answer object for a changed-smoking option.
 *
 * @param {Object} answer - Answer object for one tobacco type.
 * @param {string} change - Smoking change key.
 * @returns {Object} Change-specific answer object.
 */
const getSmokingChangeAnswer = (answer = {}, change) => {
  const answerKey = smokingChangeTypes[change]?.answerKey

  return answerKey ? answer[answerKey] || {} : {}
}

/**
 * Build contextual comparison text for changed-smoking questions.
 *
 * @param {string} type - Tobacco type key.
 * @param {string} change - Smoking change key.
 * @param {Object} answer - Answer object for one tobacco type.
 * @returns {string} Comparison text.
 */
const getSmokingChangeComparisonText = (type, change, answer = {}) => {
  const smokingChange = smokingChangeTypes[change]
  const amount = getSmokingCurrentAmount(type, answer)
  const changeLabel = type === 'rolling_tobacco' && change === 'fewer'
    ? 'less'
    : smokingChange?.label

  if (!smokingChange) {
    return ''
  }

  if (!amount) {
    return `when you smoked ${changeLabel}`
  }

  return `when you smoked ${changeLabel} than ${amount}`
}

/**
 * Build the heading for changed-smoking frequency, quantity and years pages.
 *
 * @param {string} page - Changed-smoking page id.
 * @param {string} type - Tobacco type key.
 * @param {string} change - Smoking change key.
 * @param {Object} changeAnswer - Change-specific answer object.
 * @param {Object} answer - Answer object for one tobacco type.
 * @returns {string} Contextual page heading.
 */
const getSmokingChangeHeading = (page, type, change, changeAnswer = {}, answer = {}) => {
  const smokingType = smokingTypes[type]
  const smokingChange = smokingChangeTypes[change]

  if (!smokingType || !smokingChange) {
    return ''
  }

  const comparisonText = getSmokingChangeComparisonText(type, change, answer)

  if (page === 'smoking-frequency-change' || page === 'smoking-quantity-change') {
    const headingType = page === 'smoking-frequency-change' ? 'frequencyHeading' : 'quantityHeading'
    const baseHeading = applySmokingFrequencyPeriod(getSmokingTypeHeadings(type, true)[headingType], answer.smokingFrequency)

    return baseHeading ? `${baseHeading.replace('?', '')} ${comparisonText}?` : ''
  }

  if (page === 'smoking-years-change') {
    const quantity = getSmokingQuantity(type, changeAnswer.quantity)

    if (!quantity) {
      return getQuestion('smoking-years-change').heading.title
    }

    return `How many years did you smoke ${[quantity, getSmokingFrequencyPeriod(answer.smokingFrequency)].filter(Boolean).join(' ')}?`
  }

  return ''
}

/**
 * Format a multi-value answer as either text or bullet-list HTML.
 *
 * @param {string|string[]} value - Submitted value or values.
 * @param {Object.<string, string>} labels - Value-to-label map.
 * @returns {Object} Summary-list value config.
 */
const formatListValue = (value, labels) => {
  if (!value) {
    return {}
  }

  const values = Array.isArray(value) ? value : [value]
  const labelValues = values.map((item) => labels[item] || item)

  if (labelValues.length > 1) {
    return {
      html: `<ul class="nhsuk-list nhsuk-list--bullet">${labelValues.map((label) => `<li>${escapeHtml(label)}</li>`).join('')}</ul>`
    }
  }

  return {
    value: labelValues[0]
  }
}

/**
 * Build all check-your-answers summary-list sections.
 *
 * @param {Object} answers - Session answers object.
 * @returns {Object} Summary-list rows grouped by section.
 */
const getCheckYourAnswers = (answers = {}) => {
  const selectedSmokingTypes = getSelectedSmokingTypes(answers)
  const isFormerSmoker = answers.smoker === 'yes_previous'

  const tobaccoRows = selectedSmokingTypes.map((type) => {
    const answer = answers[type] || {}
    const isPast = isPastSmokingType(answers, answer)
    const smokingType = getSmokingTypeHeadings(type, isPast)
    const shishaSettingRows = getSelectedShishaSettings(answer).flatMap((setting) => {
      const settingAnswer = getShishaSettingAnswer(answer, setting)

      return [
        makeSummaryRow({
          key: getSmokingStepHeading('smoking-frequency', type, setting, isPast, settingAnswer),
          value: formatValue(settingAnswer.smokingFrequency, valueLabels.smokingFrequency),
          href: getSmokingTypeStepUrl({ page: 'smoking-frequency', type, setting })
        }),
        makeSummaryRow({
          key: getSmokingStepHeading('smoking-quantity', type, setting, isPast, settingAnswer),
          value: getSmokingQuantity(type, settingAnswer.smokingQuantity),
          href: getSmokingTypeStepUrl({ page: 'smoking-quantity', type, setting })
        })
      ]
    })
    const smokingChangeRows = getSelectedSmokingChanges(answer).flatMap((change) => {
      const changeAnswer = getSmokingChangeAnswer(answer, change)

      return [
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-frequency-change', type, change, changeAnswer, answer),
          value: formatValue(changeAnswer.frequency, valueLabels.smokingFrequency),
          href: getSmokingTypeStepUrl({ page: 'smoking-frequency-change', type, change })
        }),
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-quantity-change', type, change, changeAnswer, answer),
          value: getSmokingQuantity(type, changeAnswer.quantity),
          href: getSmokingTypeStepUrl({ page: 'smoking-quantity-change', type, change })
        }),
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-years-change', type, change, changeAnswer, answer),
          value: changeAnswer.years && formatQuantity(changeAnswer.years, 'year', 'years'),
          href: getSmokingTypeStepUrl({ page: 'smoking-years-change', type, change })
        })
      ]
    })
    const rows = makeSummaryRows([
      !isFormerSmoker && makeSummaryRow({
        key: smokingType.statusHeading,
        value: formatValue(answer.smokingStatus, valueLabels.smokingStatus),
        href: getSmokingTypeStepUrl({ page: 'smoking-status', type })
      }),
      type === 'shisha' && makeSummaryRow({
        key: smokingType.settingHeading,
        ...formatListValue(answer.smokingSetting, valueLabels.smokingSetting),
        href: getSmokingTypeStepUrl({ page: 'smoking-setting', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: getSmokingStepHeading('smoking-frequency', type, undefined, isPast, answer),
        value: formatValue(answer.smokingFrequency, valueLabels.smokingFrequency),
        href: getSmokingTypeStepUrl({ page: 'smoking-frequency', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: getSmokingStepHeading('smoking-quantity', type, undefined, isPast, answer),
        value: getSmokingQuantity(type, answer.smokingQuantity),
        href: getSmokingTypeStepUrl({ page: 'smoking-quantity', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: smokingType.changeHeading,
        ...formatListValue(answer.smokingChange, getSmokingChangeLabels(type, answer, isPast)),
        href: getSmokingTypeStepUrl({ page: 'smoking-change', type })
      }),
      ...shishaSettingRows,
      ...smokingChangeRows
    ])

    return {
      heading: valueLabels.smokingType[type],
      rows
    }
  }).filter((section) => section.rows.length)

  return {
    eligibility: makeSummaryRows([
      makeSummaryRow({
        key: 'Have you ever smoked tobacco?',
        value: formatValue(answers.smoker, valueLabels.smoker),
        href: `/prototype_${version}/smoker`,
        visuallyHiddenText: 'whether you have ever smoked tobacco'
      }),
      makeSummaryRow({
        key: 'Date of birth',
        value: formatDateOfBirth(answers.dateOfBirth),
        href: `/prototype_${version}/date-of-birth`
      }),
      makeSummaryRow({
        key: 'Do you need to leave the online service and ask for a face-to-face appointment?',
        value: formatValue(answers.faceToFaceAppointment, valueLabels.faceToFaceAppointment),
        href: `/prototype_${version}/face-to-face-appointment`
      })
    ]),
    aboutYou: makeSummaryRows([
      makeSummaryRow({
        key: 'Height',
        value: formatHeight(answers.height),
        href: answers.height?.imperial ? `/prototype_${version}/height-imperial` : `/prototype_${version}/height-metric`
      }),
      makeSummaryRow({
        key: 'Weight',
        value: formatWeight(answers.weight),
        href: answers.weight?.imperial ? `/prototype_${version}/weight-imperial` : `/prototype_${version}/weight-metric`
      }),
      makeSummaryRow({
        key: 'Gender identity',
        value: formatValue(answers.gender, valueLabels.gender),
        href: `/prototype_${version}/gender`
      }),
      makeSummaryRow({
        key: 'Sex at birth',
        value: formatValue(answers.sex, valueLabels.sex),
        href: `/prototype_${version}/sex`
      }),
      makeSummaryRow({
        key: 'Ethnic background',
        value: formatValue(answers.ethnicity, valueLabels.ethnicity),
        href: `/prototype_${version}/ethnicity`
      }),
      makeSummaryRow({
        key: 'Education',
        value: formatValue(answers.education, valueLabels.education),
        href: `/prototype_${version}/education`
      })
    ]),
    health: makeSummaryRows([
      makeSummaryRow({
        key: 'Respiratory conditions',
        ...formatListValue(answers.respiratoryConditions, valueLabels.respiratoryConditions),
        href: `/prototype_${version}/respiratory-conditions`
      }),
      makeSummaryRow({
        key: 'Worked in a job where you might have been exposed to asbestos',
        value: formatValue(answers.asbestosAtWork, valueLabels.asbestosAtWork),
        href: `/prototype_${version}/asbestos-at-work`
      }),
      makeSummaryRow({
        key: 'Lived with anyone who worked with asbestos',
        value: formatValue(answers.asbestosAtHome, valueLabels.asbestosAtHome),
        href: `/prototype_${version}/asbestos-at-home`
      }),
      makeSummaryRow({
        key: 'Ever been diagnosed with cancer',
        value: formatValue(answers.cancerDiagnosis, valueLabels.cancerDiagnosis),
        href: `/prototype_${version}/cancer-diagnosis`
      })
    ]),
    familyHistory: makeSummaryRows([
      makeSummaryRow({
        key: 'Parents, siblings or children diagnosed with lung cancer',
        value: formatValue(answers.cancerDiagnosisRelatives, valueLabels.cancerDiagnosisRelatives),
        href: `/prototype_${version}/cancer-diagnosis-relatives`
      }),
      answers.cancerDiagnosisRelatives === 'yes' && makeSummaryRow({
        key: 'Relatives younger than 60 when diagnosed with lung cancer',
        value: formatValue(answers.cancerDiagnosisRelativesAge, valueLabels.cancerDiagnosisRelativesAge),
        href: `/prototype_${version}/cancer-diagnosis-relatives-age`
      })
    ]),
    smokingHabits: makeSummaryRows([
      makeSummaryRow({
        key: 'Age you started smoking',
        value: answers.ageStartedSmoking && `Age ${answers.ageStartedSmoking}`,
        href: `/prototype_${version}/age-started-smoking`
      }),
      isFormerSmoker && makeSummaryRow({
        key: 'Age you stopped smoking',
        value: answers.ageStoppedSmoking && `Age ${answers.ageStoppedSmoking}`,
        href: `/prototype_${version}/age-stopped-smoking`
      }),
      makeSummaryRow({
        key: 'Stopped smoking for periods of 1 year or longer',
        value: formatValue(answers.periodsStoppedSmoking, valueLabels.periodsStoppedSmoking),
        href: `/prototype_${version}/periods-stopped-smoking`
      }),
      answers.periodsStoppedSmoking === 'yes' && makeSummaryRow({
        key: 'Total number of years you stopped smoking',
        value: answers.yearsStoppedSmoking && formatQuantity(answers.yearsStoppedSmoking, 'year', 'years'),
        href: `/prototype_${version}/periods-stopped-smoking`
      }),
      makeSummaryRow({
        key: 'Types of tobacco smoked',
        ...formatListValue(answers.smokingType, valueLabels.smokingType),
        href: `/prototype_${version}/smoking-type`
      })
    ]),
    tobaccoRows
  }
}

/**
 * Resolve the active tobacco step from the current request query.
 *
 * @param {Object} req - Express request object.
 * @param {string} page - Current tobacco page id.
 * @returns {{step: SmokingTypeStep|undefined, steps: SmokingTypeStep[]}} Active step and all steps.
 */
const getSmokingTypeStep = (req, page) => {
  const { answers } = req.session.data
  const steps = getSmokingTypeSteps(answers)
  const queryType = req.query?.type
  const queryChange = req.query?.change
  const querySetting = req.query?.setting
  const step = steps.find((step) => step.page === page && step.type === queryType && step.change === queryChange && step.setting === querySetting) ||
    steps.find((step) => step.page === page && step.type === queryType && !step.change && !step.setting) ||
    steps.find((step) => step.page === page)

  return { step, steps }
}

/**
 * Skip smoking-status for former smokers by falling back to their first type step.
 *
 * @param {Object} req - Express request object.
 * @param {string} page - Current tobacco page id.
 * @param {SmokingTypeStep[]} steps - Ordered tobacco steps.
 * @returns {SmokingTypeStep|boolean} Fallback step, or false when not applicable.
 */
const getFormerSmokerFallbackStep = (req, page, steps) => {
  if (page !== 'smoking-status' || req.session.data.answers?.smoker !== 'yes_previous') {
    return false
  }

  return steps.find((step) => step.type === req.query?.type) || steps[0]
}

/**
 * Get smoking-type page variants based on the smoker answer.
 *
 * @param {Object} answers - Session answers object.
 * @returns {Object} Runtime question overrides.
 */
const getSmokingTypeQuestionOverrides = (answers = {}) => {
  const question = getQuestion('smoking-type')

  if (answers.smoker === 'yes_previous') {
    return question.variants.previous
  }

  return {}
}

/**
 * Clone a question's component items with contextual labels or hints.
 *
 * @param {string} id - Question id.
 * @param {Object.<string, string>} labels - Value-to-label overrides.
 * @param {Object.<string, string>} hintOverrides - Value-to-hint overrides.
 * @returns {Object[]} NHS component items.
 */
const getQuestionItemsWithLabels = (id, labels = {}, hintOverrides = {}) => {
  return getQuestion(id).items.map((item) => {
    if (!item.value) {
      return item
    }

    return {
      ...item,
      text: labels[item.value] || item.text,
      hint: hintOverrides[item.value]
        ? { text: hintOverrides[item.value] }
        : item.hint
    }
  })
}

const removeQuestionMark = (value = '') => value.replace(/\?$/, '')

const lowerFirst = (value = '') => {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : ''
}

/**
 * Convert a question heading into an error-message answer phrase.
 *
 * @param {string} heading - Question heading.
 * @returns {string} Error-message phrase.
 */
const getAnswerPhraseFromHeading = (heading = '') => {
  return lowerFirst(removeQuestionMark(heading))
    .replace(/^how often did you smoke /, 'how often you smoked ')
    .replace(/^how often do you smoke /, 'how often you smoke ')
    .replace(/^(how (?:much|many) .+?) did you smoke /, '$1 you smoked ')
    .replace(/^(how (?:much|many) .+?) do you currently smoke /, '$1 you currently smoke ')
    .replace(/^(how (?:much|many) .+?) do you smoke /, '$1 you smoke ')
}

/**
 * Convert a yes/no style heading into a "Select whether..." error.
 *
 * @param {string} heading - Question heading.
 * @returns {string} Required error text.
 */
const getSelectWhetherText = (heading = '') => {
  const text = removeQuestionMark(heading)
  const hasChangedMatch = heading.match(/^Has (.+) changed over time\?$/)
  const didChangeMatch = heading.match(/^Did (.+) change over time\?$/)

  if (hasChangedMatch) {
    return `Select whether ${hasChangedMatch[1]} has changed over time`
  }

  if (didChangeMatch) {
    return `Select whether ${didChangeMatch[1]} changed over time`
  }

  return `Select whether ${lowerFirst(text)
    .replace(/^do you /, 'you ')
    .replace(/^did you usually smoke /, 'you usually smoked ')
    .replace(/^did you /, 'you ')
    .replace(/^have you /, 'you have ')
    .replace(/^have any /, 'any ')
    .replace(/^were any /, 'any ')}`
}

/**
 * Build contextual required error text from the current heading.
 *
 * @param {Object} question - Base question config.
 * @param {Object} overrides - Runtime question overrides.
 * @returns {string} Required error text.
 */
const getContextualRequiredErrorText = (question, overrides) => {
  const heading = overrides.heading?.title || question.heading?.title || ''
  const questionType = overrides.type || question.type

  if (heading.startsWith('How often')) {
    return `Select ${getAnswerPhraseFromHeading(heading)}`
  }

  if (heading.startsWith('How much') || heading.startsWith('How many')) {
    return `${questionType === 'single' ? 'Select' : 'Enter'} ${getAnswerPhraseFromHeading(heading)}`
  }

  return getSelectWhetherText(heading)
}

/**
 * Build contextual invalid-number error text from the current heading.
 *
 * @param {Object} question - Base question config.
 * @param {Object} overrides - Runtime question overrides.
 * @returns {string|undefined} Invalid error text when applicable.
 */
const getContextualInvalidErrorText = (question, overrides) => {
  const heading = overrides.heading?.title || question.heading?.title || ''

  if (heading.startsWith('How much') || heading.startsWith('How many')) {
    return `Enter ${getAnswerPhraseFromHeading(heading)} using numbers`
  }

  return undefined
}

/**
 * Build runtime question overrides for the tobacco sub-flow.
 *
 * @param {Object} params - Tobacco override inputs.
 * @param {string} params.page - Current tobacco page id.
 * @param {SmokingTypeStep} params.step - Current tobacco step.
 * @param {Object} params.answer - Answer object for one tobacco type.
 * @param {Object} params.settingAnswer - Shisha setting answer object.
 * @param {Object} params.changeAnswer - Changed-smoking answer object.
 * @param {Object} params.smokingType - Tobacco type content.
 * @param {Object} params.smokingChange - Smoking change content.
 * @param {Object} params.smokingChangeLabels - Contextual smoking change labels.
 * @param {boolean} params.isPastSmokingType - Whether past-tense content is active.
 * @returns {Object} Runtime question overrides.
 */
const getSmokingContentQuestionOverrides = ({
  page,
  step,
  answer,
  settingAnswer,
  changeAnswer,
  smokingType,
  smokingChange,
  smokingChangeLabels,
  isPastSmokingType
}) => {
  if (page === 'smoking-status') {
    return {
      heading: {
        title: smokingType.statusHeading,
        caption: smokingType.caption
      },
      input: {
        name: `answers[${step.type}][smokingStatus]`
      },
      value: answer.smokingStatus
    }
  }

  if (page === 'smoking-setting') {
    return {
      heading: {
        title: smokingType.settingHeading,
        caption: smokingType.caption
      },
      input: {
        name: `answers[${step.type}][smokingSetting]`
      },
      values: answer.smokingSetting
    }
  }

  if (page === 'smoking-frequency') {
    const isSettingSpecific = Boolean(step.setting)

    return {
      heading: {
        title: getSmokingStepHeading(page, step.type, step.setting, isPastSmokingType, isSettingSpecific ? settingAnswer : answer),
        caption: smokingType.caption
      },
      input: {
        name: isSettingSpecific
          ? `answers[${step.type}][${step.setting}][smokingFrequency]`
          : `answers[${step.type}][smokingFrequency]`
      },
      value: isSettingSpecific ? settingAnswer.smokingFrequency : answer.smokingFrequency,
      items: getQuestionItemsWithLabels('smoking-frequency', {}, {
        monthly: `Select this option if you ${isPastSmokingType ? 'smoked' : 'smoke'} at least once a month`
      })
    }
  }

  if (page === 'smoking-quantity') {
    const isSettingSpecific = Boolean(step.setting)
    const isRollingTobacco = step.type === 'rolling_tobacco'

    return {
      type: isRollingTobacco ? 'single' : 'text',
      heading: {
        title: getSmokingStepHeading(page, step.type, step.setting, isPastSmokingType, isSettingSpecific ? settingAnswer : answer),
        caption: smokingType.caption
      },
      input: {
        id: 'smoking-quantity',
        name: isSettingSpecific
          ? `answers[${step.type}][${step.setting}][smokingQuantity]`
          : `answers[${step.type}][smokingQuantity]`,
        hint: isRollingTobacco
          ? 'A standard size pouch usually contains 30g of tobacco, a larger pouch is usually 50g'
          : 'Give an estimate if you are not sure',
        hintParam: {
          text: isRollingTobacco
            ? 'A standard size pouch usually contains 30g of tobacco, a larger pouch is usually 50g'
            : 'Give an estimate if you are not sure'
        },
        suffix: isRollingTobacco ? undefined : smokingType.suffix
      },
      validation: isRollingTobacco
        ? { required: true, type: null }
        : undefined,
      value: isSettingSpecific ? settingAnswer.smokingQuantity : answer.smokingQuantity
    }
  }

  if (page === 'smoking-change') {
    return {
      heading: {
        title: smokingType.changeHeading,
        caption: smokingType.caption
      },
      input: {
        name: `answers[${step.type}][smokingChange]`
      },
      values: answer.smokingChange,
      items: getQuestionItemsWithLabels('smoking-change', smokingChangeLabels)
    }
  }

  if (page === 'smoking-frequency-change') {
    return {
      heading: {
        title: getSmokingChangeHeading(page, step.type, step.change, changeAnswer, answer),
        caption: smokingType.caption
      },
      input: {
        name: `answers[${step.type}][${smokingChange.answerKey}][frequency]`
      },
      value: changeAnswer.frequency,
      items: getQuestion('smoking-frequency-change').items
    }
  }

  if (page === 'smoking-quantity-change') {
    const isRollingTobacco = step.type === 'rolling_tobacco'

    return {
      type: isRollingTobacco ? 'single' : 'text',
      heading: {
        title: getSmokingChangeHeading(page, step.type, step.change, changeAnswer, answer),
        caption: smokingType.caption
      },
      input: {
        id: 'smoking-quantity-change',
        name: `answers[${step.type}][${smokingChange.answerKey}][quantity]`,
        hint: isRollingTobacco
          ? 'A standard size pouch usually contains 30g of tobacco, a larger pouch is usually 50g'
          : 'Give an estimate if you are not sure',
        hintParam: {
          text: isRollingTobacco
            ? 'A standard size pouch usually contains 30g of tobacco, a larger pouch is usually 50g'
            : 'Give an estimate if you are not sure'
        },
        suffix: isRollingTobacco ? undefined : smokingType.suffix
      },
      validation: isRollingTobacco
        ? { required: true, type: null }
        : undefined,
      value: changeAnswer.quantity
    }
  }

  if (page === 'smoking-years-change') {
    return {
      heading: {
        title: getSmokingChangeHeading(page, step.type, step.change, changeAnswer, answer),
        caption: smokingType.caption
      },
      input: {
        id: 'smoking-years-change',
        name: `answers[${step.type}][${smokingChange.answerKey}][years]`
      },
      value: changeAnswer.years
    }
  }

  return {}
}

/**
 * Build action URLs for a tobacco sub-flow step.
 *
 * @param {SmokingTypeStep} step - Current tobacco step.
 * @param {SmokingTypeStep[]} steps - Ordered tobacco steps.
 * @returns {ActionLinks} Action URLs.
 */
const getSmokingTypeActions = (step, steps) => {
  const index = steps.findIndex((item) => item.page === step.page && item.type === step.type && item.change === step.change && item.setting === step.setting)
  const previousStep = steps[index - 1]
  const nextStep = steps[index + 1]

  return {
    next: getSmokingTypeStepUrl(step),
    back: previousStep ? getSmokingTypeStepUrl(previousStep) : `/prototype_${version}/smoking-type`,
    onward: nextStep ? getSmokingTypeStepUrl(nextStep) : nextStepAfterSmokingTypes,
    cancel: `/prototype_${version}/`
  }
}

/**
 * Render a tobacco sub-flow page, resolving the active step and context.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} page - Current tobacco page id.
 * @param {Object[]} [errors] - Validation errors.
 */
const renderSmokingTypeQuestion = (req, res, page, errors = []) => {
  const { step, steps } = getSmokingTypeStep(req, page)

  if (!step) {
    const fallbackStep = getFormerSmokerFallbackStep(req, page, steps)

    if (fallbackStep) {
      res.redirect(getSmokingTypeStepUrl(fallbackStep))
      return
    }

    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  const answer = req.session.data.answers[step.type] || {}
  const isPast = isPastSmokingType(req.session.data.answers, answer)
  const changeAnswer = getSmokingChangeAnswer(answer, step.change)
  const settingAnswer = getShishaSettingAnswer(answer, step.setting)
  const smokingType = getSmokingTypeHeadings(step.type, isPast)
  const smokingChange = smokingChangeTypes[step.change]
  const smokingChangeLabels = getSmokingChangeLabels(step.type, answer, isPast)
  const genericQuestionPages = [
    'smoking-status',
    'smoking-setting',
    'smoking-frequency',
    'smoking-quantity',
    'smoking-change',
    'smoking-frequency-change',
    'smoking-quantity-change',
    'smoking-years-change'
  ]

  if (genericQuestionPages.includes(page)) {
    renderQuestion(res, page, getSmokingTypeActions(step, steps), errors, getSmokingContentQuestionOverrides({
      page,
      step,
      answer,
      settingAnswer,
      changeAnswer,
      smokingType,
      smokingChange,
      smokingChangeLabels,
      isPastSmokingType: isPast
    }))
    return
  }

  res.render(view(`questions/${page}`), {
    type: step.type,
    change: step.change,
    setting: step.setting,
    smokingType,
    smokingChange,
    smokingChangeLabels,
    smokingSetting: shishaSmokingSettings[step.setting],
    changeAnswer,
    settingAnswer,
    isPastSmokingType: isPast,
    questionHeading: getSmokingStepHeading(page, step.type, step.setting, isPast, step.setting ? settingAnswer : answer),
    changeHeading: getSmokingChangeHeading(page, step.type, step.change, changeAnswer, answer),
    errors,
    actions: getSmokingTypeActions(step, steps)
  })
}

/**
 * Validate a tobacco sub-flow page with contextual headings and errors.
 *
 * @param {Object} req - Express request object.
 * @param {string} page - Current tobacco page id.
 * @param {SmokingTypeStep} step - Current tobacco step.
 * @returns {Object[]} Validation errors.
 */
const validateSmokingTypeQuestion = (req, page, step) => {
  const answer = req.session.data.answers[step.type] || {}
  const isPast = isPastSmokingType(req.session.data.answers, answer)
  const changeAnswer = getSmokingChangeAnswer(answer, step.change)
  const settingAnswer = getShishaSettingAnswer(answer, step.setting)
  const smokingType = getSmokingTypeHeadings(step.type, isPast)
  const smokingChange = smokingChangeTypes[step.change]
  const smokingChangeLabels = getSmokingChangeLabels(step.type, answer, isPast)
  const overrides = getSmokingContentQuestionOverrides({
    page,
    step,
    answer,
    settingAnswer,
    changeAnswer,
    smokingType,
    smokingChange,
    smokingChangeLabels,
    isPastSmokingType: isPast
  })
  const questionType = overrides.type || getQuestion(page).type
  const question = getQuestion(page)
  const errorHref = overrides.input.id || question.input.id
  const errors = {
    ...overrides.errors,
    required: {
      ...question.errors?.required,
      ...overrides.errors?.required,
      text: getContextualRequiredErrorText(question, overrides),
      href: `#${errorHref}`
    }
  }

  if (questionType === 'text' && question.errors?.invalid) {
    errors.invalid = {
      ...question.errors.invalid,
      ...overrides.errors?.invalid,
      text: getContextualInvalidErrorText(question, overrides) || question.errors.invalid.text,
      href: `#${errorHref}`
    }
  }

  return validateQuestion(req.session.data.answers, page, {
    ...overrides,
    errors
  })
}

/// ------------------------------------------------------------------------ ///
///
/// ------------------------------------------------------------------------ ///

exports.acceptTerms_get = (req, res) => {
  res.render(view('questions/accept-terms'), {
    actions: {
      next: `/prototype_${version}/accept-terms`,
      cancel: `/prototype_${version}`
    }
  })
}

exports.acceptTerms_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/accept-terms'), {
      errors,
      actions: {
        next: `/prototype_${version}/accept-terms`,
        cancel: `/prototype_${version}`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/phone-questionnaire`)
  }
}

exports.phoneQuestionnaire_get = (req, res) => {
  renderQuestion(res, 'phone-questionnaire', {
    next: `/prototype_${version}/phone-questionnaire`,
    cancel: `/prototype_${version}/`
  })
}

exports.phoneQuestionnaire_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'phone-questionnaire')

  if (errors.length) {
    renderQuestion(res, 'phone-questionnaire', {
      next: `/prototype_${version}/phone-questionnaire`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.phoneQuestionnaire === 'yes') {
      res.redirect(`/prototype_${version}/phone-questionnaire-exit`)
    } else {
      res.redirect(`/prototype_${version}/smoker`)
    }
  }
}

exports.phoneQuestionnaireExit_get = (req, res) => {
  res.render(view('questions/phone-questionnaire-exit'), {
    actions: {
      back: `/prototype_${version}/phone-questionnaire`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// Eligibility
/// ------------------------------------------------------------------------ ///

exports.smoker_get = (req, res) => {
  renderQuestion(res, 'smoker', {
    next: `/prototype_${version}/smoker`,
    back: `/prototype_${version}/phone-questionnaire`,
    cancel: `/prototype_${version}/`
  })
}

exports.smoker_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'smoker')

  if (errors.length) {
    renderQuestion(res, 'smoker', {
      next: `/prototype_${version}/smoker`,
      back: `/prototype_${version}/phone-questionnaire`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (['no', 'yes_fewer_than_100'].includes(answers.smoker)) {
      res.redirect(`/prototype_${version}/not-eligible-for-screening`)
    } else {
      res.redirect(`/prototype_${version}/date-of-birth`)
    }
  }
}

exports.dateOfBirth_get = (req, res) => {
  renderQuestion(res, 'date-of-birth', {
    next: `/prototype_${version}/date-of-birth`,
    back: `/prototype_${version}/smoker`,
    cancel: `/prototype_${version}/`
  })
}

exports.dateOfBirth_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'date-of-birth')
  const dateOfBirth = getDateOfBirth(answers)

  if (errors.length) {
    renderQuestion(res, 'date-of-birth', {
      next: `/prototype_${version}/date-of-birth`,
      back: `/prototype_${version}/smoker`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (!isEligibleForScanAge(dateOfBirth)) {
      res.redirect(`/prototype_${version}/not-eligible-for-scan`)
    } else {
      res.redirect(`/prototype_${version}/face-to-face-appointment`)
    }
  }
}

exports.faceToFaceAppointment_get = (req, res) => {
  renderQuestion(res, 'face-to-face-appointment', {
    next: `/prototype_${version}/face-to-face-appointment`,
    back: `/prototype_${version}/date-of-birth`,
    cancel: `/prototype_${version}/`
  })
}

exports.faceToFaceAppointment_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'face-to-face-appointment')

  if (errors.length) {
    renderQuestion(res, 'face-to-face-appointment', {
      next: `/prototype_${version}/face-to-face-appointment`,
      back: `/prototype_${version}/date-of-birth`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.faceToFaceAppointment === 'yes') {
      res.redirect(`/prototype_${version}/book-appointment`)
    } else {
      res.redirect(`/prototype_${version}/height-metric`)
    }
  }
}

exports.notEligibleForScreening_get = (req, res) => {
  res.render(view('questions/not-eligible-for-screening'), {
    actions: {
      back: `/prototype_${version}/smoker`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.notEligibleForScan_get = (req, res) => {
  res.render(view('questions/not-eligible-for-scan'), {
    actions: {
      back: `/prototype_${version}/date-of-birth`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.bookAppointment_get = (req, res) => {
  res.render(view('questions/book-appointment'), {
    actions: {
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// About you
/// ------------------------------------------------------------------------ ///

exports.heightMetric_get = (req, res) => {
  renderQuestion(res, 'height-metric', {
    next: `/prototype_${version}/height-metric`,
    switchUnits: `/prototype_${version}/height-imperial`,
    back: `/prototype_${version}/face-to-face-appointment`,
    cancel: `/prototype_${version}/`
  })
}

exports.heightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'height-metric')

  if (errors.length) {
    renderQuestion(res, 'height-metric', {
      next: `/prototype_${version}/height-metric`,
      switchUnits: `/prototype_${version}/height-imperial`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.height?.imperial
    res.redirect(getWeightNext(req, 'metric'))
  }
}

exports.heightImperial_get = (req, res) => {
  renderQuestion(res, 'height-imperial', {
    next: `/prototype_${version}/height-imperial`,
    switchUnits: `/prototype_${version}/height-metric`,
    back: `/prototype_${version}/face-to-face-appointment`,
    cancel: `/prototype_${version}/`
  })
}

exports.heightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'height-imperial')

  if (errors.length) {
    renderQuestion(res, 'height-imperial', {
      next: `/prototype_${version}/height-imperial`,
      switchUnits: `/prototype_${version}/height-metric`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.height?.metric
    res.redirect(getWeightNext(req, 'imperial'))
  }
}

exports.weightMetric_get = (req, res) => {
  const back = getHeightBack(req)

  renderQuestion(res, 'weight-metric', {
    next: `/prototype_${version}/weight-metric`,
    switchUnits: `/prototype_${version}/weight-imperial`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.weightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = validateQuestion(answers, 'weight-metric')

  if (errors.length) {
    renderQuestion(res, 'weight-metric', {
      next: `/prototype_${version}/weight-metric`,
      switchUnits: `/prototype_${version}/weight-imperial`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.weight?.imperial
    res.redirect(`/prototype_${version}/gender`)
  }
}

exports.weightImperial_get = (req, res) => {
  const back = getHeightBack(req)

  renderQuestion(res, 'weight-imperial', {
    next: `/prototype_${version}/weight-imperial`,
    switchUnits: `/prototype_${version}/weight-metric`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.weightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = validateQuestion(answers, 'weight-imperial')

  if (errors.length) {
    renderQuestion(res, 'weight-imperial', {
      next: `/prototype_${version}/weight-imperial`,
      switchUnits: `/prototype_${version}/weight-metric`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.weight?.metric
    res.redirect(`/prototype_${version}/gender`)
  }
}

exports.gender_get = (req, res) => {
  const back = getWeightBack(req)

  renderQuestion(res, 'gender', {
    next: `/prototype_${version}/gender`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.gender_post = (req, res) => {
  const { answers } = req.session.data
  const back = getWeightBack(req)
  const errors = validateQuestion(answers, 'gender')

  if (errors.length) {
    renderQuestion(res, 'gender', {
      next: `/prototype_${version}/gender`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/sex`)
  }
}

exports.sex_get = (req, res) => {
  renderQuestion(res, 'sex', {
    next: `/prototype_${version}/sex`,
    back: `/prototype_${version}/gender`,
    cancel: `/prototype_${version}/`
  })
}

exports.sex_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'sex')

  if (errors.length) {
    renderQuestion(res, 'sex', {
      next: `/prototype_${version}/sex`,
      back: `/prototype_${version}/gender`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/ethnicity`)
  }
}

exports.ethnicity_get = (req, res) => {
  renderQuestion(res, 'ethnicity', {
    next: `/prototype_${version}/ethnicity`,
    back: `/prototype_${version}/sex`,
    cancel: `/prototype_${version}/`
  })
}

exports.ethnicity_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'ethnicity')

  if (errors.length) {
    renderQuestion(res, 'ethnicity', {
      next: `/prototype_${version}/ethnicity`,
      back: `/prototype_${version}/sex`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/education`)
  }
}

exports.education_get = (req, res) => {
  renderQuestion(res, 'education', {
    next: `/prototype_${version}/education`,
    back: `/prototype_${version}/ethnicity`,
    cancel: `/prototype_${version}/`
  })
}

exports.education_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'education')

  if (errors.length) {
    renderQuestion(res, 'education', {
      next: `/prototype_${version}/education`,
      back: `/prototype_${version}/ethnicity`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/respiratory-conditions`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Your health
/// ------------------------------------------------------------------------ ///

exports.respiratoryConditions_get = (req, res) => {
  renderQuestion(res, 'respiratory-conditions', {
    next: `/prototype_${version}/respiratory-conditions`,
    back: `/prototype_${version}/education`,
    cancel: `/prototype_${version}/`
  })
}

exports.respiratoryConditions_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'respiratory-conditions')

  if (errors.length) {
    renderQuestion(res, 'respiratory-conditions', {
      next: `/prototype_${version}/respiratory-conditions`,
      back: `/prototype_${version}/education`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/asbestos-at-work`)
  }
}

exports.asbestosAtWork_get = (req, res) => {
  renderQuestion(res, 'asbestos-at-work', {
    next: `/prototype_${version}/asbestos-at-work`,
    back: `/prototype_${version}/respiratory-conditions`,
    cancel: `/prototype_${version}/`
  })
}

exports.asbestosAtWork_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'asbestos-at-work')

  if (errors.length) {
    renderQuestion(res, 'asbestos-at-work', {
      next: `/prototype_${version}/asbestos-at-work`,
      back: `/prototype_${version}/respiratory-conditions`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/asbestos-at-home`)
  }
}

exports.asbestosAtHome_get = (req, res) => {
  renderQuestion(res, 'asbestos-at-home', {
    next: `/prototype_${version}/asbestos-at-home`,
    back: `/prototype_${version}/asbestos-at-work`,
    cancel: `/prototype_${version}/`
  })
}

exports.asbestosAtHome_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'asbestos-at-home')

  if (errors.length) {
    renderQuestion(res, 'asbestos-at-home', {
      next: `/prototype_${version}/asbestos-at-home`,
      back: `/prototype_${version}/asbestos-at-work`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis`)
  }
}

exports.cancerDiagnosis_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis', {
    next: `/prototype_${version}/cancer-diagnosis`,
    back: `/prototype_${version}/asbestos-at-work`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosis_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis', {
      next: `/prototype_${version}/cancer-diagnosis`,
      back: `/prototype_${version}/asbestos-at-work`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis-relatives`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Family history
/// ------------------------------------------------------------------------ ///

exports.cancerDiagnosisRelatives_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis-relatives', {
    next: `/prototype_${version}/cancer-diagnosis-relatives`,
    back: `/prototype_${version}/cancer-diagnosis`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosisRelatives_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis-relatives')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis-relatives', {
      next: `/prototype_${version}/cancer-diagnosis-relatives`,
      back: `/prototype_${version}/cancer-diagnosis`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.cancerDiagnosisRelatives === 'yes') {
      res.redirect(`/prototype_${version}/cancer-diagnosis-relatives-age`)
    } else {
      delete answers.cancerDiagnosisRelativesAge
      res.redirect(`/prototype_${version}/age-started-smoking`)
    }
  }
}

exports.cancerDiagnosisRelativesAge_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis-relatives-age', {
    next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
    back: `/prototype_${version}/cancer-diagnosis-relatives`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosisRelativesAge_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis-relatives-age')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis-relatives-age', {
      next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
      back: `/prototype_${version}/cancer-diagnosis-relatives`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/age-started-smoking`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Smoking habits
/// ------------------------------------------------------------------------ ///

exports.ageStartedSmoking_get = (req, res) => {
  const { answers } = req.session.data
  const back = answers?.cancerDiagnosisRelativesAge ? `/prototype_${version}/cancer-diagnosis-relatives-age` : `/prototype_${version}/cancer-diagnosis-relatives`

  renderQuestion(res, 'age-started-smoking', {
    next: `/prototype_${version}/age-started-smoking`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.ageStartedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const back = answers?.cancerDiagnosisRelativesAge ? `/prototype_${version}/cancer-diagnosis-relatives-age` : `/prototype_${version}/cancer-diagnosis-relatives`

  const errors = validateQuestion(answers, 'age-started-smoking')

  // TODO:
  // If not answered, throw error
  // If the age started smoking is older than person's age
  // based on date of birth, throw error

  if (errors.length) {
    renderQuestion(res, 'age-started-smoking', {
      next: `/prototype_${version}/age-started-smoking`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.smoker === 'yes_previous') {
      res.redirect(`/prototype_${version}/age-stopped-smoking`)
    } else {
      delete answers.ageStoppedSmoking
      res.redirect(`/prototype_${version}/periods-stopped-smoking`)
    }
  }
}

exports.ageStoppedSmoking_get = (req, res) => {
  const { answers } = req.session.data

  if (answers.smoker !== 'yes_previous') {
    res.redirect(`/prototype_${version}/periods-stopped-smoking`)
    return
  }

  renderQuestion(res, 'age-stopped-smoking', {
    next: `/prototype_${version}/age-stopped-smoking`,
    back: `/prototype_${version}/age-started-smoking`,
    cancel: `/prototype_${version}/`
  })
}

exports.ageStoppedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'age-stopped-smoking')

  if (answers.smoker !== 'yes_previous') {
    delete answers.ageStoppedSmoking
    res.redirect(`/prototype_${version}/periods-stopped-smoking`)
    return
  }

  // TODO:
  // If not answered, throw error
  // If the age stopped smoking is older than person's age
  // based on date of birth, throw error

  if (errors.length) {
    renderQuestion(res, 'age-stopped-smoking', {
      next: `/prototype_${version}/age-stopped-smoking`,
      back: `/prototype_${version}/age-started-smoking`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/periods-stopped-smoking`)
  }
}

exports.periodsStoppedSmoking_get = (req, res) => {
  const answers = req.session.data.answers || {}
  const back = answers.smoker === 'yes_previous' ? `/prototype_${version}/age-stopped-smoking` : `/prototype_${version}/age-started-smoking`

  renderQuestion(res, 'periods-stopped-smoking', {
    next: `/prototype_${version}/periods-stopped-smoking`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.periodsStoppedSmoking_post = (req, res) => {
  const answers = req.session.data.answers || {}
  const back = answers.smoker === 'yes_previous' ? `/prototype_${version}/age-stopped-smoking` : `/prototype_${version}/age-started-smoking`
  const errors = validateQuestion(answers, 'periods-stopped-smoking')

  if (errors.length) {
    renderQuestion(res, 'periods-stopped-smoking', {
      next: `/prototype_${version}/periods-stopped-smoking`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.periodsStoppedSmoking === 'no') {
      delete answers.yearsStoppedSmoking
    }
    res.redirect(`/prototype_${version}/smoking-type`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Tobacco
/// ------------------------------------------------------------------------ ///

exports.smokingType_get = (req, res) => {
  const answers = req.session.data.answers || {}

  renderQuestion(res, 'smoking-type', {
    next: `/prototype_${version}/smoking-type`,
    back: `/prototype_${version}/periods-stopped-smoking`,
    cancel: `/prototype_${version}/`
  }, [], getSmokingTypeQuestionOverrides(answers))
}

exports.smokingType_post = (req, res) => {
  const answers = req.session.data.answers || {}
  const errors = validateQuestion(answers, 'smoking-type')

  if (errors.length) {
    renderQuestion(res, 'smoking-type', {
      next: `/prototype_${version}/smoking-type`,
      back: `/prototype_${version}/periods-stopped-smoking`,
      cancel: `/prototype_${version}/`
    }, errors, getSmokingTypeQuestionOverrides(answers))
  } else {
    const selectedTypes = Array.isArray(answers.smokingType)
      ? answers.smokingType
      : [answers.smokingType].filter(Boolean)
    deleteUnselectedSmokingTypeAnswers(answers)
    if (answers.smoker === 'yes_previous') {
      getSelectedSmokingTypes(answers).forEach((type) => {
        delete answers[type]?.smokingStatus
      })
    }
    const steps = getSmokingTypeSteps(answers)

    if (selectedTypes.includes('none')) {
      res.redirect(`/prototype_${version}/smoking-type-exit`)
    } else if (steps.length) {
      res.redirect(getSmokingTypeStepUrl(steps[0]))
    } else {
      res.redirect(`/prototype_${version}/smoking-type`)
    }
  }
}

exports.smokingTypeExit_get = (req, res) => {
  res.render(view('questions/smoking-type-exit'), {
    actions: {
      back: `/prototype_${version}/smoking-type`
    }
  })
}

exports.smokingStatus_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-status')
}

exports.smokingStatus_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-status')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-status', step) : []

  if (!step) {
    const fallbackStep = getFormerSmokerFallbackStep(req, 'smoking-status', steps)

    if (fallbackStep) {
      res.redirect(getSmokingTypeStepUrl(fallbackStep))
      return
    }

    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-status', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingFrequency_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-frequency')
}

exports.smokingFrequency_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-frequency')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-frequency', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-frequency', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingQuantity_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-quantity')
}

exports.smokingQuantity_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-quantity')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-quantity', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-quantity', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingSetting_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-setting')
}

exports.smokingSetting_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-setting')
  const { answers } = req.session.data
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-setting', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  deleteUnselectedShishaSettingAnswers(answers[step.type])

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-setting', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingChange_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-change')
}

exports.smokingChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-change')
  const { answers } = req.session.data
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-change', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  deleteUnselectedSmokingChangeAnswers(answers[step.type])

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingFrequencyChange_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-frequency-change')
}

exports.smokingFrequencyChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-frequency-change')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-frequency-change', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-frequency-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingQuantityChange_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-quantity-change')
}

exports.smokingQuantityChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-quantity-change')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-quantity-change', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-quantity-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingYearsChange_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-years-change')
}

exports.smokingYearsChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-years-change')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-years-change', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-years-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

/// ------------------------------------------------------------------------ ///
/// Check your answers
/// ------------------------------------------------------------------------ ///

exports.checkYourAnswers_get = (req, res) => {
  const { answers } = req.session.data
  const smokingSteps = getSmokingTypeSteps(answers)
  const lastSmokingStep = smokingSteps[smokingSteps.length - 1]

  res.render(view('check-your-answers'), {
    checkYourAnswers: getCheckYourAnswers(answers),
    actions: {
      next: `/prototype_${version}/check-your-answers`,
      back: lastSmokingStep ? getSmokingTypeStepUrl(lastSmokingStep) : `/prototype_${version}/smoking-type`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.checkYourAnswers_post = (req, res) => {
  res.redirect(`/prototype_${version}/confirmation`)
}

/// ------------------------------------------------------------------------ ///
/// Confirmation
/// ------------------------------------------------------------------------ ///

exports.confirmation_get = (req, res) => {
  res.render(view('confirmation'))
}
