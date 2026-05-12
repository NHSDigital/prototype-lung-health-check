const { nhsukDate } = require('../../filters/dates')

const version = 'v4'

const view = (template) => {
  return `prototype_${version}/views/${template}`
}

const getHeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.height?.imperial ? `/prototype_${version}/height-imperial` : `/prototype_${version}/height-metric`
}

const getWeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.weight?.imperial ? `/prototype_${version}/weight-imperial` : `/prototype_${version}/weight-metric`
}

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

const getAge = (dateOfBirth) => {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

const isEligibleForScanAge = (dateOfBirth) => {
  const age = getAge(dateOfBirth)

  return age >= 55 && age <= 74
}

const smokingTypes = {
  cigarettes: {
    caption: 'Cigarette smoking',
    statusHeading: 'Do you currently smoke cigarettes?',
    frequencyHeading: 'How often do you smoke cigarettes?',
    quantityHeading: 'How many cigarettes do you currently smoke in a normal day?',
    changeHeading: 'Has the number of cigarettes you normally smoke changed over time?',
    quantityUnit: 'cigarettes',
    singularSuffix: 'cigarette',
    suffix: 'cigarettes'
  },
  rolling_tobacco: {
    caption: 'Rolling tobacco smoking',
    statusHeading: 'Do you currently smoke rolling tobacco or roll-ups?',
    frequencyHeading: 'How often do you smoke rolling tobacco or roll-ups?',
    quantityHeading: 'How much rolling tobacco do you currently smoke in a normal week?',
    changeHeading: 'Has the amount of rolling tobacco you normally smoke changed over time?',
    quantityUnit: 'rolling tobacco'
  },
  pipes: {
    caption: 'Pipe smoking',
    statusHeading: 'Do you currently smoke a pipe?',
    frequencyHeading: 'How often do you smoke a pipe?',
    quantityHeading: 'How many full pipe loads do you currently smoke in a normal day?',
    changeHeading: 'Has the number of full pipe loads you normally smoke changed over time?',
    quantityUnit: 'full pipe loads',
    singularSuffix: 'full pipe load',
    suffix: 'full pipe loads'
  },
  small_cigars: {
    caption: 'Small cigar smoking',
    statusHeading: 'Do you currently smoke small cigars?',
    frequencyHeading: 'How often do you smoke small cigars?',
    quantityHeading: 'How many small cigars do you currently smoke in a normal day?',
    changeHeading: 'Has the number of small cigars you normally smoke changed over time?',
    quantityUnit: 'small cigars',
    singularSuffix: 'small cigar',
    suffix: 'small cigars'
  },
  medium_cigars: {
    caption: 'Medium cigar smoking',
    statusHeading: 'Do you currently smoke medium cigars?',
    frequencyHeading: 'How often do you smoke medium cigars?',
    quantityHeading: 'How many medium cigars do you currently smoke in a normal day?',
    changeHeading: 'Has the number of medium cigars you normally smoke changed over time?',
    quantityUnit: 'medium cigars',
    singularSuffix: 'medium cigar',
    suffix: 'medium cigars'
  },
  large_cigars: {
    caption: 'Large cigar smoking',
    statusHeading: 'Do you currently smoke large cigars?',
    frequencyHeading: 'How often do you smoke large cigars?',
    quantityHeading: 'How many large cigars do you currently smoke in a normal day?',
    changeHeading: 'Has the number of large cigars you normally smoke changed over time?',
    quantityUnit: 'large cigars',
    singularSuffix: 'large cigar',
    suffix: 'large cigars'
  },
  cigarillos: {
    caption: 'Cigarillo smoking',
    statusHeading: 'Do you currently smoke cigarillos?',
    frequencyHeading: 'How often do you smoke cigarillos?',
    quantityHeading: 'How many cigarillos do you currently smoke in a normal day?',
    changeHeading: 'Has the number of cigarillos you normally smoke changed over time?',
    quantityUnit: 'cigarillos',
    singularSuffix: 'cigarillo',
    suffix: 'cigarillos'
  },
  shisha: {
    caption: 'Shisha smoking',
    statusHeading: 'Do you currently smoke shisha?',
    settingHeading: 'Do you usually smoke shisha in a group or on your own?',
    frequencyHeading: 'How often do you smoke shisha?',
    quantityHeading: 'How many hours do you currently smoke shisha in a normal day?',
    quantityUnit: 'hours',
    singularSuffix: 'hour',
    suffix: 'hours'
  }
}

const nextStepAfterSmokingTypes = `/prototype_${version}/check-your-answers`

const smokingChangeTypes = {
  increased: {
    answerKey: 'smokingChangeIncrease',
    label: 'increased'
  },
  decreased: {
    answerKey: 'smokingChangeDecrease',
    label: 'decreased'
  }
}

const shishaSmokingSettings = {
  group: {
    label: 'In a group',
    headingText: 'in a group'
  },
  individual: {
    label: 'By myself',
    headingText: 'by yourself'
  }
}

const getSelectedSmokingTypes = (answers = {}) => {
  const selectedTypes = Array.isArray(answers.smokingType)
    ? answers.smokingType
    : [answers.smokingType].filter(Boolean)

  return Object.keys(smokingTypes).filter((type) => selectedTypes.includes(type))
}

const deleteUnselectedSmokingTypeAnswers = (answers = {}) => {
  const selectedTypes = getSelectedSmokingTypes(answers)

  Object.keys(smokingTypes).forEach((type) => {
    if (!selectedTypes.includes(type)) {
      delete answers[type]
    }
  })
}

const getSelectedSmokingChanges = (answer = {}) => {
  const selectedChanges = Array.isArray(answer.smokingChange)
    ? answer.smokingChange
    : [answer.smokingChange].filter(Boolean)

  return Object.keys(smokingChangeTypes).filter((change) => selectedChanges.includes(change))
}

const deleteUnselectedSmokingChangeAnswers = (answer = {}) => {
  const selectedChanges = getSelectedSmokingChanges(answer)

  Object.entries(smokingChangeTypes).forEach(([change, changeType]) => {
    if (!selectedChanges.includes(change)) {
      delete answer[changeType.answerKey]
    }
  })
}

const getSelectedShishaSettings = (answer = {}) => {
  const selectedSettings = Array.isArray(answer.smokingSetting)
    ? answer.smokingSetting
    : [answer.smokingSetting].filter(Boolean)

  return Object.keys(shishaSmokingSettings).filter((setting) => selectedSettings.includes(setting))
}

const deleteUnselectedShishaSettingAnswers = (answer = {}) => {
  const selectedSettings = getSelectedShishaSettings(answer)

  Object.keys(shishaSmokingSettings).forEach((setting) => {
    if (!selectedSettings.includes(setting)) {
      delete answer[setting]
    }
  })
}

const getSmokingTypeSteps = (answers = {}) => {
  return getSelectedSmokingTypes(answers).flatMap((type) => {
    const steps = []
    const answer = answers[type] || {}

    steps.push({ page: 'smoking-status', type })

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

const formatDateOfBirth = (dateOfBirth = {}) => {
  if (!dateOfBirth.day || !dateOfBirth.month || !dateOfBirth.year) {
    return ''
  }

  return nhsukDate(
    `${dateOfBirth.year}-${String(dateOfBirth.month).padStart(2, '0')}-${String(dateOfBirth.day).padStart(2, '0')}`
  )
}

const formatHeight = (height = {}) => {
  if (height.metric) {
    return `${height.metric} cm`
  }

  if (height.imperial?.feet || height.imperial?.inches) {
    return `${height.imperial.feet || 0} feet ${height.imperial.inches || 0} inches`
  }

  return ''
}

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
  asbestosAtHome: {
    yes: 'Yes',
    no: 'No'
  },
  asbestosAtWork: {
    yes: 'Yes',
    no: 'No'
  },
  cancerDiagnosis: {
    yes: 'Yes',
    no: 'No'
  },
  cancerDiagnosisRelatives: {
    yes: 'Yes',
    no: 'No',
    do_not_know: 'I do not know'
  },
  cancerDiagnosisRelativesAge: {
    yes: 'Yes, they were younger than 60',
    no: 'No, they were 60 or older',
    do_not_know: 'I do not know'
  },
  education: {
    before_15: 'I finished school before the age of 15',
    gcse: 'GCSEs',
    a_level: 'A-levels',
    further_education: 'Further education',
    undergraduate_degree: 'Undergraduate degree',
    postgraduate_degree: 'Postgraduate degree',
    prefer_not_to_say: 'I prefer not to say'
  },
  ethnicity: {
    asian_or_asian_british: 'Asian or Asian British',
    'black_african_caribbean_or_black british': 'Black, African, Caribbean or Black British',
    mixed_or_multiple_ethnic_groups: 'Mixed or multiple ethnic groups',
    white: 'White',
    other_ethnic_group: 'Other ethnic group',
    prefer_not_to_say: 'I prefer not to say'
  },
  faceToFaceAppointment: {
    yes: 'Yes',
    no: 'No'
  },
  gender: {
    female: 'Female',
    male: 'Male',
    non_binary: 'Non-binary',
    prefer_not_to_say: 'I prefer not to say'
  },
  periodsStoppedSmoking: {
    yes: 'Yes',
    no: 'No'
  },
  respiratoryConditions: {
    pneumonia: 'Pneumonia',
    emphysema: 'Emphysema',
    bronchitis: 'Bronchitis',
    tuberculosis: 'Tuberculosis (TB)',
    chronic_obstructive_pulmonary_disease: 'Chronic obstructive pulmonary disease (COPD)',
    no: 'No, I have not had any of these respiratory conditions'
  },
  sex: {
    female: 'Female',
    male: 'Male'
  },
  smoker: {
    yes_current: 'Yes, I currently smoke',
    yes_previous: 'Yes, I used to smoke',
    yes_fewer_than_100: 'Yes, but I have smoked fewer than 100 cigarettes in my lifetime',
    no: 'No, I have never smoked'
  },
  smokingChange: {
    increased: 'Yes, my smoking increased',
    decreased: 'Yes, my smoking decreased',
    no: 'No, it has not changed'
  },
  smokingFrequency: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  },
  smokingStatus: {
    yes: 'Yes',
    no: 'No'
  },
  smokingQuantityRollingTobacco: {
    less_than_10: 'Less than 10g',
    '10_to_30': '10g to 30g',
    '31_to_50': '31g to 50g',
    '51_to_75': '51g to 75g',
    '76_to_100': '76g to 100g',
    more_than_100: 'More than 100g'
  },
  smokingSetting: {
    group: 'In a group',
    individual: 'By myself'
  },
  smokingType: {
    cigarettes: 'Cigarettes',
    rolling_tobacco: 'Rolling tobacco, or roll-ups',
    pipes: 'Pipes',
    small_cigars: 'Small cigars',
    medium_cigars: 'Medium cigars',
    large_cigars: 'Large cigars',
    cigarillos: 'Cigarillos',
    shisha: 'Shisha',
    none: 'I have not smoked any of these types of tobacco'
  }
}

const formatValue = (value, labels) => {
  if (!value) {
    return ''
  }

  const values = Array.isArray(value) ? value : [value]

  return values.map((item) => labels?.[item] || item).join(', ')
}

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

const makeSummaryRows = (rows) => rows.filter(Boolean)

const formatQuantity = (value, singular, plural) => {
  return `${value} ${Number(value) === 1 ? singular : plural}`
}

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

const getShishaSettingAnswer = (answer = {}, setting) => {
  return setting ? answer[setting] || {} : {}
}

const getSmokingStepHeading = (page, type, setting) => {
  const smokingType = smokingTypes[type]
  const shishaSetting = shishaSmokingSettings[setting]

  if (!smokingType) {
    return ''
  }

  if (type === 'shisha' && shishaSetting) {
    if (page === 'smoking-frequency') {
      return `How often do you smoke shisha ${shishaSetting.headingText}?`
    }

    if (page === 'smoking-quantity') {
      return `How many hours do you currently smoke shisha ${shishaSetting.headingText} in a normal day?`
    }
  }

  return smokingType[`${page.replace('smoking-', '')}Heading`] || ''
}

const getSmokingChangeAnswer = (answer = {}, change) => {
  const answerKey = smokingChangeTypes[change]?.answerKey

  return answerKey ? answer[answerKey] || {} : {}
}

const getSmokingChangeHeading = (page, type, change, changeAnswer = {}) => {
  const smokingType = smokingTypes[type]
  const smokingChange = smokingChangeTypes[change]

  if (!smokingType || !smokingChange) {
    return ''
  }

  if (page === 'smoking-frequency-change') {
    return `${smokingType.frequencyHeading.replace('How often do you smoke', 'How often did you smoke').replace('?', '')} when your smoking ${smokingChange.label}?`
  }

  if (page === 'smoking-quantity-change') {
    return `${smokingType.quantityHeading.replace('do you', 'did you').replace('currently ', '').replace('?', '')} when your smoking ${smokingChange.label}?`
  }

  if (page === 'smoking-years-change') {
    const quantity = getSmokingQuantity(type, changeAnswer.quantity) || `[${smokingType.quantityUnit}]`
    return `How many years did you smoke ${quantity} a day?`
  }

  return ''
}

const formatListValue = (value, labels) => {
  if (!value) {
    return {}
  }

  const values = Array.isArray(value) ? value : [value]
  const labelValues = values.map((item) => labels[item] || item)

  if (labelValues.length > 1) {
    return {
      html: `<ul class="nhsuk-list nhsuk-list--bullet">${labelValues.map((label) => `<li>${label}</li>`).join('')}</ul>`
    }
  }

  return {
    value: labelValues[0]
  }
}

const getCheckYourAnswers = (answers = {}) => {
  const selectedSmokingTypes = getSelectedSmokingTypes(answers)

  const tobaccoRows = selectedSmokingTypes.map((type) => {
    const answer = answers[type] || {}
    const smokingType = smokingTypes[type]
    const shishaSettingRows = getSelectedShishaSettings(answer).flatMap((setting) => {
      const settingAnswer = getShishaSettingAnswer(answer, setting)

      return [
        makeSummaryRow({
          key: getSmokingStepHeading('smoking-frequency', type, setting),
          value: formatValue(settingAnswer.smokingFrequency, valueLabels.smokingFrequency),
          href: getSmokingTypeStepUrl({ page: 'smoking-frequency', type, setting })
        }),
        makeSummaryRow({
          key: getSmokingStepHeading('smoking-quantity', type, setting),
          value: getSmokingQuantity(type, settingAnswer.smokingQuantity),
          href: getSmokingTypeStepUrl({ page: 'smoking-quantity', type, setting })
        })
      ]
    })
    const smokingChangeRows = getSelectedSmokingChanges(answer).flatMap((change) => {
      const changeAnswer = getSmokingChangeAnswer(answer, change)

      return [
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-frequency-change', type, change),
          value: formatValue(changeAnswer.frequency, valueLabels.smokingFrequency),
          href: getSmokingTypeStepUrl({ page: 'smoking-frequency-change', type, change })
        }),
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-quantity-change', type, change),
          value: getSmokingQuantity(type, changeAnswer.quantity),
          href: getSmokingTypeStepUrl({ page: 'smoking-quantity-change', type, change })
        }),
        makeSummaryRow({
          key: getSmokingChangeHeading('smoking-years-change', type, change, changeAnswer),
          value: changeAnswer.years && formatQuantity(changeAnswer.years, 'year', 'years'),
          href: getSmokingTypeStepUrl({ page: 'smoking-years-change', type, change })
        })
      ]
    })
    const rows = makeSummaryRows([
      makeSummaryRow({
        key: smokingType.statusHeading,
        value: formatValue(answer.smokingStatus, valueLabels.smokingStatus),
        href: getSmokingTypeStepUrl({ page: 'smoking-status', type })
      }),
      type === 'shisha' && makeSummaryRow({
        key: 'Do you usually smoke shisha in a group or on your own?',
        ...formatListValue(answer.smokingSetting, valueLabels.smokingSetting),
        href: getSmokingTypeStepUrl({ page: 'smoking-setting', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: smokingType.frequencyHeading,
        value: formatValue(answer.smokingFrequency, valueLabels.smokingFrequency),
        href: getSmokingTypeStepUrl({ page: 'smoking-frequency', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: smokingType.quantityHeading,
        value: getSmokingQuantity(type, answer.smokingQuantity),
        href: getSmokingTypeStepUrl({ page: 'smoking-quantity', type })
      }),
      type !== 'shisha' && makeSummaryRow({
        key: smokingType.changeHeading,
        ...formatListValue(answer.smokingChange, valueLabels.smokingChange),
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

const renderSmokingTypeQuestion = (req, res, page, errors = []) => {
  const { step, steps } = getSmokingTypeStep(req, page)

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  const answer = req.session.data.answers[step.type] || {}
  const changeAnswer = getSmokingChangeAnswer(answer, step.change)
  const settingAnswer = getShishaSettingAnswer(answer, step.setting)

  res.render(view(`questions/${page}`), {
    type: step.type,
    change: step.change,
    setting: step.setting,
    smokingType: smokingTypes[step.type],
    smokingChange: smokingChangeTypes[step.change],
    smokingSetting: shishaSmokingSettings[step.setting],
    changeAnswer,
    settingAnswer,
    questionHeading: getSmokingStepHeading(page, step.type, step.setting),
    changeHeading: getSmokingChangeHeading(page, step.type, step.change, changeAnswer),
    errors,
    actions: getSmokingTypeActions(step, steps)
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

  res.render(view('questions/phone-questionnaire'), {
    actions: {
      next: `/prototype_${version}/phone-questionnaire`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.phoneQuestionnaire_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/phone-questionnaire'), {
      errors,
      actions: {
        next: `/prototype_${version}/phone-questionnaire`,
        cancel: `/prototype_${version}/`
      }
    })
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

  res.render(view('questions/smoker'), {
    actions: {
      next: `/prototype_${version}/smoker`,
      back: `/prototype_${version}/phone-questionnaire`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.smoker_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/smoker'), {
      errors,
      actions: {
        next: `/prototype_${version}/smoker`,
        back: `/prototype_${version}/phone-questionnaire`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    if (answers.smoker === 'no') {
      res.redirect(`/prototype_${version}/not-eligible-for-screening`)
    } else {
      res.redirect(`/prototype_${version}/date-of-birth`)
    }
  }
}

exports.dateOfBirth_get = (req, res) => {

  res.render(view('questions/date-of-birth'), {
    actions: {
      next: `/prototype_${version}/date-of-birth`,
      back: `/prototype_${version}/smoker`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.dateOfBirth_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []
  const dateOfBirth = getDateOfBirth(answers)

  if (!dateOfBirth) {
    errors.push({
      text: 'Enter a real date of birth',
      href: '#dateOfBirth-day'
    })
  }

  if (errors.length) {
    res.render(view('questions/date-of-birth'), {
      errors,
      actions: {
        next: `/prototype_${version}/date-of-birth`,
        back: `/prototype_${version}/smoker`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    if (!isEligibleForScanAge(dateOfBirth)) {
      res.redirect(`/prototype_${version}/not-eligible-for-scan`)
    } else {
      res.redirect(`/prototype_${version}/face-to-face-appointment`)
    }
  }
}

exports.faceToFaceAppointment_get = (req, res) => {

  res.render(view('questions/face-to-face-appointment'), {
    actions: {
      next: `/prototype_${version}/face-to-face-appointment`,
      back: `/prototype_${version}/date-of-birth`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.faceToFaceAppointment_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/face-to-face-appointment'), {
      errors,
      actions: {
        next: `/prototype_${version}/face-to-face-appointment`,
        back: `/prototype_${version}/date-of-birth`,
        cancel: `/prototype_${version}/`
      }
    })
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
  res.render(view('questions/height-metric'), {
    actions: {
      next: `/prototype_${version}/height-metric`,
      switchUnits: `/prototype_${version}/height-imperial`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.heightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/height-metric'), {
      errors,
      actions: {
        next: `/prototype_${version}/height-metric`,
        switchUnits: `/prototype_${version}/height-imperial`,
        back: `/prototype_${version}/face-to-face-appointment`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    delete answers.height?.imperial
    res.redirect(getWeightNext(req, 'metric'))
  }
}

exports.heightImperial_get = (req, res) => {
  res.render(view('questions/height-imperial'), {
    actions: {
      next: `/prototype_${version}/height-imperial`,
      switchUnits: `/prototype_${version}/height-metric`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.heightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/height-imperial'), {
      errors,
      actions: {
        next: `/prototype_${version}/height-imperial`,
        switchUnits: `/prototype_${version}/height-metric`,
        back: `/prototype_${version}/face-to-face-appointment`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    delete answers.height?.metric
    res.redirect(getWeightNext(req, 'imperial'))
  }
}

exports.weightMetric_get = (req, res) => {
  const back = getHeightBack(req)

  res.render(view('questions/weight-metric'), {
    actions: {
      next: `/prototype_${version}/weight-metric`,
      switchUnits: `/prototype_${version}/weight-imperial`,
      back,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.weightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight-metric'), {
      errors,
      actions: {
        next: `/prototype_${version}/weight-metric`,
        switchUnits: `/prototype_${version}/weight-imperial`,
        back,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    delete answers.weight?.imperial
    res.redirect(`/prototype_${version}/gender`)
  }
}

exports.weightImperial_get = (req, res) => {
  const back = getHeightBack(req)

  res.render(view('questions/weight-imperial'), {
    actions: {
      next: `/prototype_${version}/weight-imperial`,
      switchUnits: `/prototype_${version}/weight-metric`,
      back,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.weightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight-imperial'), {
      errors,
      actions: {
        next: `/prototype_${version}/weight-imperial`,
        switchUnits: `/prototype_${version}/weight-metric`,
        back,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    delete answers.weight?.metric
    res.redirect(`/prototype_${version}/gender`)
  }
}

exports.gender_get = (req, res) => {
  const back = getWeightBack(req)

  res.render(view('questions/gender'), {
    actions: {
      next: `/prototype_${version}/gender`,
      back,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.gender_post = (req, res) => {
  const back = getWeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/gender'), {
      errors,
      actions: {
        next: `/prototype_${version}/gender`,
        back,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/sex`)
  }
}

exports.sex_get = (req, res) => {
  res.render(view('questions/sex'), {
    actions: {
      next: `/prototype_${version}/sex`,
      back: `/prototype_${version}/gender`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.sex_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/sex'), {
      errors,
      actions: {
        next: `/prototype_${version}/sex`,
        back: `/prototype_${version}/gender`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/ethnicity`)
  }
}

exports.ethnicity_get = (req, res) => {

  res.render(view('questions/ethnicity'), {
    actions: {
      next: `/prototype_${version}/ethnicity`,
      back: `/prototype_${version}/gender`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.ethnicity_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/ethnicity'), {
      errors,
      actions: {
        next: `/prototype_${version}/ehtnicity`,
        back: `/prototype_${version}/gender`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/education`)
  }
}

exports.education_get = (req, res) => {

  res.render(view('questions/education'), {
    actions: {
      next: `/prototype_${version}/education`,
      back: `/prototype_${version}/ethnicity`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.education_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/education'), {
      errors,
      actions: {
        next: `/prototype_${version}/education`,
        back: `/prototype_${version}/ethnicity`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/respiratory-conditions`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Your health
/// ------------------------------------------------------------------------ ///

exports.respiratoryConditions_get = (req, res) => {

  res.render(view('questions/respiratory-conditions'), {
    actions: {
      next: `/prototype_${version}/respiratory-conditions`,
      back: `/prototype_${version}/education`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.respiratoryConditions_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/respiratory-conditions'), {
      errors,
      actions: {
        next: `/prototype_${version}/respiratory-conditions`,
        back: `/prototype_${version}/education`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/asbestos-at-work`)
  }
}

exports.asbestosAtWork_get = (req, res) => {

  res.render(view('questions/asbestos-at-work'), {
    actions: {
      next: `/prototype_${version}/asbestos-at-work`,
      back: `/prototype_${version}/respiratory-conditions`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.asbestosAtWork_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/asbestos-at-work'), {
      errors,
      actions: {
        next: `/prototype_${version}/asbestos-at-work`,
        back: `/prototype_${version}/respiratory-conditions`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/asbestos-at-home`)
  }
}

exports.asbestosAtHome_get = (req, res) => {

  res.render(view('questions/asbestos-at-home'), {
    actions: {
      next: `/prototype_${version}/asbestos-at-home`,
      back: `/prototype_${version}/asbestos-at-work`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.asbestosAtHome_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/asbestos-at-home'), {
      errors,
      actions: {
        next: `/prototype_${version}/asbestos-at-home`,
        back: `/prototype_${version}/asbestos-at-work`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis`)
  }
}

exports.cancerDiagnosis_get = (req, res) => {

  res.render(view('questions/cancer-diagnosis'), {
    actions: {
      next: `/prototype_${version}/cancer-diagnosis`,
      back: `/prototype_${version}/asbestos-at-work`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.cancerDiagnosis_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis'), {
      errors,
      actions: {
        next: `/prototype_${version}/cancer-diagnosis`,
        back: `/prototype_${version}/asbestos-at-work`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis-relatives`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Family history
/// ------------------------------------------------------------------------ ///

exports.cancerDiagnosisRelatives_get = (req, res) => {

  res.render(view('questions/cancer-diagnosis-relatives'), {
    actions: {
      next: `/prototype_${version}/cancer-diagnosis-relatives`,
      back: `/prototype_${version}/cancer-diagnosis`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.cancerDiagnosisRelatives_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis-relatives'), {
      errors,
      actions: {
        next: `/prototype_${version}/cancer-diagnosis-relatives`,
        back: `/prototype_${version}/cancer-diagnosis`,
        cancel: `/prototype_${version}/`
      }
    })
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

  res.render(view('questions/cancer-diagnosis-relatives-age'), {
    actions: {
      next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
      back: `/prototype_${version}/cancer-diagnosis-relatives`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.cancerDiagnosisRelativesAge_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis-relatives-age'), {
      errors,
      actions: {
        next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
        back: `/prototype_${version}/cancer-diagnosis-relatives`,
        cancel: `/prototype_${version}/`
      }
    })
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

  res.render(view('questions/age-started-smoking'), {
    actions: {
      next: `/prototype_${version}/age-started-smoking`,
      back,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.ageStartedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const back = answers?.cancerDiagnosisRelativesAge ? `/prototype_${version}/cancer-diagnosis-relatives-age` : `/prototype_${version}/cancer-diagnosis-relatives`

  const errors = []

  // TODO:
  // If not answered, throw error
  // If the age started smoking is older than person's age
  // based on date of birth, throw error

  if (errors.length) {
    res.render(view('questions/age-started-smoking'), {
      errors,
      actions: {
        next: `/prototype_${version}/age-started-smoking`,
        back,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/periods-stopped-smoking`)
  }
}

exports.periodsStoppedSmoking_get = (req, res) => {
  res.render(view('questions/periods-stopped-smoking'), {
    actions: {
      next: `/prototype_${version}/periods-stopped-smoking`,
      back: `/prototype_${version}/age-started-smoking`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.periodsStoppedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/periods-stopped-smoking'), {
      errors,
      actions: {
        next: `/prototype_${version}/periods-stopped-smoking`,
        back: `/prototype_${version}/age-started-smoking`,
        cancel: `/prototype_${version}/`
      }
    })
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
  res.render(view('questions/smoking-type'), {
    actions: {
      next: `/prototype_${version}/smoking-type`,
      back: `/prototype_${version}/periods-stopped-smoking`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.smokingType_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/smoking-type'), {
      errors,
      actions: {
        next: `/prototype_${version}/smoking-type`,
        back: `/prototype_${version}/periods-stopped-smoking`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    const selectedTypes = Array.isArray(answers.smokingType)
      ? answers.smokingType
      : [answers.smokingType].filter(Boolean)
    deleteUnselectedSmokingTypeAnswers(answers)
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
  const errors = []

  if (!step) {
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
  const errors = []

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
  const errors = []

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
  const errors = []

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
  const errors = []

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
  const errors = []

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
  const errors = []

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
  const errors = []

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

/// ------------------------------------------------------------------------ ///
/// Template
/// ------------------------------------------------------------------------ ///

exports.XYZ_get = (req, res) => {

  res.render(view('questions/xyz'), {
    actions: {
      next: `/prototype_${version}/xyz`,
      back: `/prototype_${version}/abc`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.XYZ_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/xyz'), {
      errors,
      actions: {
        next: `/prototype_${version}/xyz`,
        back: `/prototype_${version}/abc`,
        cancel: `/prototype_${version}/`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/mno`)
  }
}
