const {
  getQuestion,
  getQuestionValueLabels,
  refreshData,
  smokingChangeTypes,
  shishaSmokingSettings,
  tobaccoTypes: smokingTypes
} = require('./questions')
const { renderQuestion, version } = require('./question-renderer')
const { validateQuestion } = require('./question-validator')

const nextStepAfterSmokingTypes = `/prototype_${version}/check-your-answers`

const getValueLabels = () => {
  return {
    smokingChange: getQuestionValueLabels('smoking-change'),
    smokingFrequency: getQuestionValueLabels('smoking-frequency'),
    smokingSetting: getQuestionValueLabels('smoking-setting'),
    smokingStatus: getQuestionValueLabels('smoking-status'),
    smokingType: getQuestionValueLabels('smoking-type')
  }
}

/**
 * @typedef {Object} SmokingTypeStep
 * @property {string} page - Route/page id for the step.
 * @property {string} type - Tobacco type key, for example cigarettes.
 * @property {string} [setting] - Shisha setting key.
 * @property {string} [change] - Smoking change key.
 */

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
 * Convert a YAML option into the shape expected by NHS radios/checkboxes.
 *
 * @param {Object} option - YAML option definition.
 * @returns {Object} NHS component item.
 */
const toComponentItem = (option) => {
  if (option.divider) {
    return {
      divider: option.divider
    }
  }

  return {
    text: option.label,
    hint: option.hint ? { text: option.hint } : undefined,
    value: option.value,
    exclusive: option.exclusive,
    exclusiveGroup: option.exclusiveGroup,
    conditionalInput: option.conditionalInput
  }
}

/**
 * Get a question variant for a tobacco type.
 *
 * @param {string} id - Question id.
 * @param {string} type - Tobacco type key.
 * @returns {Object} Variant config.
 */
const getQuestionVariant = (id, type) => {
  return getQuestion(id).variants?.[type] || {}
}

/**
 * Build value-to-label mappings for variant quantity options.
 *
 * @param {string} id - Quantity question id.
 * @param {string} type - Tobacco type key.
 * @returns {Object.<string, string>} Map of submitted values to labels.
 */
const getQuestionVariantValueLabels = (id, type) => {
  const question = getQuestion(id)
  const variant = getQuestionVariant(id, type)

  return (variant.options || question.options || []).reduce((labels, option) => {
    if (option.value && option.label) {
      labels[option.value] = option.label
    }

    return labels
  }, {})
}

/**
 * Get selected tobacco types in tobacco.yaml order.
 *
 * @param {Object} answers - Session answers object.
 * @returns {string[]} Selected tobacco type keys.
 */
const getSelectedSmokingTypes = (answers = {}) => {
  refreshData()

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
  refreshData()

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
  refreshData()

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
 * Format a tobacco quantity answer with the correct unit label.
 *
 * @param {string} type - Tobacco type key.
 * @param {string} answer - Submitted quantity answer.
 * @returns {string} Display quantity.
 */
const getSmokingQuantity = (type, answer) => {
  refreshData()

  if (!answer) {
    return ''
  }

  const optionLabel = getQuestionVariantValueLabels('smoking-quantity', type)[answer]

  if (optionLabel) {
    return optionLabel
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

const rollingTobaccoQuantityValues = {
  less_than_10: 10,
  '10_to_30': 20,
  '31_to_50': 40.5,
  '51_to_75': 63,
  '76_to_100': 88,
  more_than_100: 100
}

const smokingFrequencyRateMultipliers = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  yearly: 1
}

/**
 * Check whether a value can be compared as a submitted numeric answer.
 *
 * @param {*} value - Submitted value.
 * @returns {boolean} True when value is numeric.
 */
const isComparableNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return false
  }

  const number = Number(value)

  return Number.isFinite(number)
}

/**
 * Get an annualised quantity value for cross-frequency comparisons.
 *
 * @param {string} type - Tobacco type key.
 * @param {*} quantity - Submitted quantity answer.
 * @param {string} frequency - Submitted frequency answer.
 * @returns {number|undefined} Annualised quantity, when comparable.
 */
const getSmokingQuantityAnnualRate = (type, quantity, frequency) => {
  const multiplier = smokingFrequencyRateMultipliers[frequency]

  if (!multiplier) {
    return undefined
  }

  if (type === 'rolling_tobacco') {
    const value = rollingTobaccoQuantityValues[quantity]

    return value ? value * multiplier : undefined
  }

  return isComparableNumber(quantity) ? Number(quantity) * multiplier : undefined
}

/**
 * Check whether a changed-smoking quantity contradicts the selected change direction.
 *
 * @param {Object} params - Comparison inputs.
 * @returns {Object|undefined} Validation error when the quantities contradict.
 */
const getSmokingQuantityChangeComparisonError = ({
  page,
  step,
  answer,
  changeAnswer,
  href
}) => {
  if (page !== 'smoking-quantity-change' || !step.change || !answer.smokingQuantity || !answer.smokingFrequency || !changeAnswer.quantity || !changeAnswer.frequency) {
    return undefined
  }

  const currentRate = getSmokingQuantityAnnualRate(step.type, answer.smokingQuantity, answer.smokingFrequency)
  const changedRate = getSmokingQuantityAnnualRate(step.type, changeAnswer.quantity, changeAnswer.frequency)

  if (currentRate === undefined || changedRate === undefined) {
    return undefined
  }

  const contradictsChange = step.change === 'greater'
    ? changedRate <= currentRate
    : changedRate >= currentRate

  if (!contradictsChange) {
    return undefined
  }

  const comparisonText = step.type === 'rolling_tobacco' && step.change === 'fewer'
    ? 'less'
    : smokingChangeTypes[step.change]?.label

  return {
    text: `Amount smoked must be ${comparisonText} than ${[getSmokingComparisonQuantity(step.type, answer.smokingQuantity), getSmokingFrequencyPeriod(answer.smokingFrequency)].filter(Boolean).join(' ')}`,
    href
  }
}

const smokingFrequencyPeriods = {
  daily: 'a day',
  weekly: 'a week',
  monthly: 'a month',
  yearly: 'a year'
}

const smokingFrequencyMaxHours = {
  daily: 24,
  weekly: 168,
  monthly: 744,
  yearly: 8760
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
 * Get the maximum number of hours allowed for an "another amount" shisha answer.
 *
 * @param {string} type - Tobacco type key.
 * @param {string} frequency - Selected smoking frequency.
 * @returns {number} Maximum number of hours.
 */
const getSmokingQuantityOtherMaxHours = (type, frequency) => {
  if (type !== 'shisha') {
    return 24
  }

  return smokingFrequencyMaxHours[frequency] || 24
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
    : getValueLabels().smokingChange

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
  refreshData()

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
  refreshData()

  const answerKey = smokingChangeTypes[change]?.answerKey

  return answerKey ? answer[answerKey] || {} : {}
}

/**
 * Get the object that stores a smoking quantity answer for the current step.
 *
 * @param {Object} answers - Session answers object.
 * @param {SmokingTypeStep} step - Current tobacco step.
 * @returns {Object} Answer object containing the quantity answer.
 */
const getSmokingQuantityAnswer = (answers = {}, step = {}) => {
  const answer = answers[step.type] || {}

  if (step.change) {
    return getSmokingChangeAnswer(answer, step.change)
  }

  if (step.setting) {
    return getShishaSettingAnswer(answer, step.setting)
  }

  return answer
}

/**
 * Remove a stale conditional reveal quantity when "another amount" is not selected.
 *
 * @param {Object} answers - Session answers object, mutated in place.
 * @param {SmokingTypeStep} step - Current tobacco step.
 * @param {string} quantityKey - Quantity answer key.
 */
const deleteUnselectedSmokingQuantityOtherAnswer = (answers = {}, step, quantityKey = 'smokingQuantity') => {
  delete answers.smokingQuantityOther

  if (!step) {
    return
  }

  const answer = getSmokingQuantityAnswer(answers, step)

  if (answer[quantityKey] !== 'another_amount') {
    delete answer.smokingQuantityOther
  }
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
  refreshData()

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

/**
 * Build runtime overrides for a quantity question.
 *
 * @param {Object} params - Quantity override inputs.
 * @returns {Object} Runtime question overrides.
 */
const getSmokingQuantityQuestionOverrides = ({
  page,
  step,
  heading,
  caption,
  name,
  value,
  conditionalValue,
  frequency,
  smokingType
}) => {
  const question = getQuestion(page)
  const variant = getQuestionVariant(page, step.type)
  const variantInput = variant.input || {}
  const hasHintOverride = Object.prototype.hasOwnProperty.call(variantInput, 'hint')
  const hint = hasHintOverride ? variantInput.hint : question.input.hint
  const questionType = variant.type || question.type
  const conditionalHref = '#smoking-quantity-other'
  const maxHours = getSmokingQuantityOtherMaxHours(step.type, frequency)
  const items = variant.options
    ? variant.options.map((option) => {
      const item = toComponentItem(option)

      if (!item.conditionalInput) {
        return item
      }

      const conditionalName = step.setting
        ? `answers[${step.type}][${step.setting}][${item.conditionalInput.answerKey}]`
        : `answers[${step.type}][${item.conditionalInput.answerKey}]`

      return {
        ...item,
        conditionalInput: {
          ...item.conditionalInput,
          name: conditionalName,
          value: conditionalValue
        }
      }
    })
    : question.items

  return {
    type: questionType,
    heading: {
      title: heading,
      caption
    },
    input: {
      id: question.input.id,
      name,
      hint,
      hintParam: hint ? { text: hint } : undefined,
      suffix: questionType === 'text' ? smokingType.suffix : undefined
    },
    validation: {
      ...variant.validation,
      conditional: {
        another_amount: {
          required: true,
          type: 'number',
          min: 0.5,
          max: maxHours,
          answerKey: 'smokingQuantityOther',
          value: conditionalValue,
          href: conditionalHref
        }
      }
    },
    errors: {
      conditional: {
        another_amount: {
          required: {
            text: 'Enter the number of hours',
            href: conditionalHref
          }
        }
      },
      invalid: {
        text: 'Number of hours must be a number',
        href: conditionalHref
      },
      min: {
        text: 'Number of hours must be 0.5 or more',
        href: conditionalHref
      },
      max: {
        text: `Number of hours must be ${maxHours} or fewer`,
        href: conditionalHref
      }
    },
    items,
    value
  }
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
    .replace(/^how long did you smoke /, 'how long you smoked ')
    .replace(/^how long do you currently smoke /, 'how long you currently smoke ')
    .replace(/^how long do you smoke /, 'how long you smoke ')
    .replace(/^(how (?:much|many|long) .+?) did you smoke /, '$1 you smoked ')
    .replace(/^(how (?:much|many|long) .+?) do you currently smoke /, '$1 you currently smoke ')
    .replace(/^(how (?:much|many|long) .+?) do you smoke /, '$1 you smoke ')
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

  if (heading.startsWith('How much') || heading.startsWith('How many') || heading.startsWith('How long')) {
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

  if (heading.startsWith('How much') || heading.startsWith('How many') || heading.startsWith('How long')) {
    return `Enter ${getAnswerPhraseFromHeading(heading)} using numbers`
  }

  return undefined
}

/**
 * Build runtime question overrides for the tobacco sub-flow.
 *
 * @param {Object} params - Tobacco override inputs.
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

    return getSmokingQuantityQuestionOverrides({
      page,
      step,
      heading: getSmokingStepHeading(page, step.type, step.setting, isPastSmokingType, isSettingSpecific ? settingAnswer : answer),
      caption: smokingType.caption,
      name: isSettingSpecific
        ? `answers[${step.type}][${step.setting}][smokingQuantity]`
        : `answers[${step.type}][smokingQuantity]`,
      value: isSettingSpecific ? settingAnswer.smokingQuantity : answer.smokingQuantity,
      conditionalValue: isSettingSpecific ? settingAnswer.smokingQuantityOther : answer.smokingQuantityOther,
      frequency: isSettingSpecific ? settingAnswer.smokingFrequency : answer.smokingFrequency,
      smokingType
    })
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
    return getSmokingQuantityQuestionOverrides({
      page,
      step,
      heading: getSmokingChangeHeading(page, step.type, step.change, changeAnswer, answer),
      caption: smokingType.caption,
      name: `answers[${step.type}][${smokingChange.answerKey}][quantity]`,
      value: changeAnswer.quantity,
      conditionalValue: changeAnswer.smokingQuantityOther,
      frequency: answer.smokingFrequency,
      smokingType
    })
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
 * @returns {Object} Action URLs.
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
  renderQuestion(res, page, getSmokingTypeActions(step, steps), errors, getSmokingContentQuestionOverrides({
    page,
    step,
    answer,
    changeAnswer,
    settingAnswer,
    smokingType,
    smokingChange,
    smokingChangeLabels,
    isPastSmokingType: isPast
  }))
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

  const validationErrors = validateQuestion(req.session.data.answers, page, {
    ...overrides,
    errors
  })
  const comparisonError = getSmokingQuantityChangeComparisonError({
    page,
    step,
    answer,
    changeAnswer,
    href: `#${errorHref}`
  })

  if (comparisonError && !validationErrors.some((error) => error.href === comparisonError.href)) {
    validationErrors.push(comparisonError)
  }

  return validationErrors
}

module.exports = {
  deleteUnselectedShishaSettingAnswers,
  deleteUnselectedSmokingQuantityOtherAnswer,
  deleteUnselectedSmokingChangeAnswers,
  deleteUnselectedSmokingTypeAnswers,
  formatQuantity,
  getSelectedShishaSettings,
  getSelectedSmokingChanges,
  getSelectedSmokingTypes,
  getShishaSettingAnswer,
  getFormerSmokerFallbackStep,
  getSmokingChangeAnswer,
  getSmokingChangeHeading,
  getSmokingChangeLabels,
  getSmokingQuantity,
  getSmokingStepHeading,
  getSmokingTypeActions,
  getSmokingTypeHeadings,
  getSmokingTypeQuestionOverrides,
  getSmokingTypeStep,
  getSmokingTypeSteps,
  getSmokingTypeStepUrl,
  isPastSmokingType,
  renderSmokingTypeQuestion,
  validateSmokingTypeQuestion,
  getValueLabels
}
