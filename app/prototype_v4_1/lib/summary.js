const { nhsukDate } = require('../../filters/dates')
const { getQuestionValueLabels } = require('./questions')
const { version } = require('./question-renderer')
const {
  formatQuantity,
  getSelectedShishaSettings,
  getSelectedSmokingChanges,
  getSelectedSmokingTypes,
  getShishaSettingAnswer,
  getSmokingChangeAnswer,
  getSmokingChangeHeading,
  getSmokingChangeLabels,
  getSmokingQuantity,
  getSmokingStepHeading,
  getSmokingTypeHeadings,
  getSmokingTypeStepUrl,
  isPastSmokingType,
  valueLabels: tobaccoValueLabels
} = require('./tobacco-flow')

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
  ...tobaccoValueLabels
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
 * @typedef {Object} SummaryRow
 * @property {Object} key - NHS summary-list key config.
 * @property {Object} [value] - NHS summary-list value config.
 * @property {Object} actions - NHS summary-list actions config.
 */

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

module.exports = {
  getCheckYourAnswers,
  valueLabels
}
