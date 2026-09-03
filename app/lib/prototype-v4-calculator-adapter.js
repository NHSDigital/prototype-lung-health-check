const { calculators } = require('./risk-calculators')
const { bmiFromAnswers, calculateAge, dateFromParts } = require('./measurements')
const { deriveTobaccoUse } = require('./tobacco-calculator-adapter')

const respiratoryConditionValues = {
  bronchitis: 'bronchitis',
  chronic_obstructive_pulmonary_disease: 'copd',
  emphysema: 'emphysema',
  pneumonia: 'previousPneumonia',
  tuberculosis: 'tuberculosis'
}

const ethnicityMap = {
  asian_or_asian_british: 'asian',
  black_african_caribbean_or_black_british: 'black',
  mixed_or_multiple_ethnic_groups: 'mixed',
  white: 'white',
  other_ethnic_group: 'other',
  prefer_not_to_say: 'not_stated'
}

const educationMap = {
  before_15: 1,
  gcse: 2,
  a_level: 3,
  further_education: 4,
  undergraduate_degree: 5,
  postgraduate_degree: 6
}

const yesNoBoolean = {
  yes: true,
  no: false
}

const toArray = (value) => Array.isArray(value) ? value : [value].filter(Boolean)

const hasCalculatorInputs = (input = {}, requiredInputs = []) => {
  return requiredInputs.every((field) => input[field] !== undefined && input[field] !== null && input[field] !== '')
}

const addIssue = (issues, field, type, message) => {
  issues.push({ field, type, message })
}

const getAge = (answers = {}, options = {}, issues = []) => {
  const dateOfBirth = dateFromParts(answers.dateOfBirth)

  if (!dateOfBirth) {
    addIssue(issues, 'dateOfBirth', 'missing', 'Date of birth is required to derive age.')
    return undefined
  }

  const age = calculateAge(dateOfBirth, options.referenceDate)

  if (age === undefined) {
    addIssue(issues, 'dateOfBirth', 'invalid', 'Date of birth could not be converted to age.')
  }

  return age
}

const getBodyMassIndex = (answers = {}, issues = []) => {
  const bodyMassIndex = bmiFromAnswers(answers)

  if (bodyMassIndex === undefined) {
    addIssue(issues, 'bodyMassIndex', 'missing', 'Height and weight are required to derive BMI.')
  }

  return bodyMassIndex
}

const getEthnicity = (answers = {}, issues = []) => {
  const ethnicity = ethnicityMap[answers.ethnicity]

  if (!ethnicity) {
    addIssue(issues, 'ethnicity', 'unmapped', 'Ethnicity answer cannot be mapped to a PLCOm2012 ethnicity category.')
  }

  return ethnicity
}

const getEducation = (answers = {}, issues = []) => {
  const education = educationMap[answers.education]

  if (!education) {
    addIssue(issues, 'education', 'unmapped', 'Education answer cannot be mapped to a PLCOm2012 education category.')
  }

  return education
}

const getRespiratoryHistory = (answers = {}) => {
  const conditions = toArray(answers.respiratoryConditions)
  const history = Object.values(respiratoryConditionValues).reduce((history, field) => {
    history[field] = false
    return history
  }, {})

  return conditions.reduce((history, condition) => {
    const field = respiratoryConditionValues[condition]

    if (field) {
      history[field] = true
    }

    return history
  }, history)
}

const getBooleanAnswer = (answers = {}, answerKey, issues = []) => {
  const answer = yesNoBoolean[answers[answerKey]]

  if (answer === undefined) {
    addIssue(issues, answerKey, 'unmapped', `${answerKey} answer must be yes or no.`)
  }

  return answer
}

const getFamilyHistoryForPlco = (answers = {}, issues = []) => {
  if (answers.cancerDiagnosisRelatives === 'yes') {
    return true
  }

  if (answers.cancerDiagnosisRelatives === 'no' || answers.cancerDiagnosisRelatives === 'do_not_know') {
    return false
  }

  addIssue(issues, 'cancerDiagnosisRelatives', 'unmapped', 'Family lung cancer history answer cannot be mapped.')
  return undefined
}

const getFamilyHistoryForLlp = (answers = {}, issues = []) => {
  if (answers.cancerDiagnosisRelatives === 'no' || answers.cancerDiagnosisRelatives === 'do_not_know') {
    return 'none'
  }

  if (answers.cancerDiagnosisRelatives !== 'yes') {
    addIssue(issues, 'cancerDiagnosisRelatives', 'unmapped', 'Family lung cancer history answer cannot be mapped.')
    return undefined
  }

  if (answers.cancerDiagnosisRelativesAge === 'yes') {
    return 'early_onset'
  }

  if (answers.cancerDiagnosisRelativesAge === 'no' || answers.cancerDiagnosisRelativesAge === 'do_not_know') {
    return 'late_onset'
  }

  addIssue(
    issues,
    'cancerDiagnosisRelativesAge',
    'unmapped',
    'Relative diagnosis age answer cannot be mapped to an LLPv2 family-history category.'
  )
  return undefined
}

const buildSharedDerivedInputs = (answers = {}, options = {}) => {
  const issues = []
  const age = getAge(answers, options, issues)
  const tobacco = deriveTobaccoUse(answers, age, { issues })
  const respiratoryHistory = getRespiratoryHistory(answers)

  return {
    age,
    bodyMassIndex: getBodyMassIndex(answers, issues),
    respiratoryHistory,
    tobacco,
    issues
  }
}

const toLlpv2Input = (answers = {}, options = {}) => {
  const derived = buildSharedDerivedInputs(answers, options)
  const { respiratoryHistory, tobacco } = derived
  const asbestosAtWork = getBooleanAnswer(answers, 'asbestosAtWork', derived.issues)
  const asbestosAtHome = getBooleanAnswer(answers, 'asbestosAtHome', derived.issues)
  const input = {
    age: derived.age,
    sex: answers.sex,
    smokingDuration: tobacco.smokingDuration,
    previousPneumonia: respiratoryHistory.previousPneumonia,
    asbestosExposure: asbestosAtWork === undefined || asbestosAtHome === undefined
      ? undefined
      : asbestosAtWork || asbestosAtHome,
    copd: respiratoryHistory.copd,
    emphysema: respiratoryHistory.emphysema,
    bronchitis: respiratoryHistory.bronchitis,
    tuberculosis: respiratoryHistory.tuberculosis,
    personalCancerHistory: getBooleanAnswer(answers, 'cancerDiagnosis', derived.issues),
    familyLungCancerHistory: getFamilyHistoryForLlp(answers, derived.issues)
  }

  return {
    calculatorId: calculators.llpv2.id,
    input,
    complete: hasCalculatorInputs(input, calculators.llpv2.requiredInputs),
    issues: derived.issues,
    derived
  }
}

const toPlcom2012Input = (answers = {}, options = {}) => {
  const derived = buildSharedDerivedInputs(answers, options)
  const { respiratoryHistory, tobacco } = derived
  const input = {
    age: derived.age,
    ethnicity: getEthnicity(answers, derived.issues),
    education: getEducation(answers, derived.issues),
    bodyMassIndex: derived.bodyMassIndex,
    copd: respiratoryHistory.copd,
    personalCancerHistory: getBooleanAnswer(answers, 'cancerDiagnosis', derived.issues),
    familyLungCancerHistory: getFamilyHistoryForPlco(answers, derived.issues),
    smokingStatus: tobacco.smokingStatus,
    smokingIntensity: tobacco.smokingIntensity,
    smokingDuration: tobacco.smokingDuration,
    quitYears: tobacco.quitYears
  }

  return {
    calculatorId: calculators.plcom2012.id,
    input,
    complete: hasCalculatorInputs(input, calculators.plcom2012.requiredInputs),
    issues: derived.issues,
    derived
  }
}

const toCalculatorInputs = (answers = {}, options = {}) => {
  return {
    llpv2: toLlpv2Input(answers, options),
    plcom2012: toPlcom2012Input(answers, options)
  }
}

module.exports = {
  educationMap,
  ethnicityMap,
  toCalculatorInputs,
  toLlpv2Input,
  toPlcom2012Input
}
