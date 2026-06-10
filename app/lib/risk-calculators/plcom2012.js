const {
  booleanInput,
  choiceInput,
  createRiskResult,
  logistic,
  normaliseToken,
  numberInput,
  prototypeCaveat,
  throwIfInputErrors
} = require('./helpers')

const id = 'plcom2012'
const name = 'PLCOm2012'

/**
 * Raw PLCOm2012 calculator input.
 *
 * @typedef {Object} PlcoM2012Input
 * @property {number|string} age Age in years.
 * @property {string} ethnicity PLCO ethnicity group or supported NHS Digital ethnicity code.
 * @property {number|string} education Education level from 1 to 6.
 * @property {number|string} bodyMassIndex Body mass index.
 * @property {boolean|string|number} copd Whether the person has COPD, emphysema or chronic bronchitis.
 * @property {boolean|string|number} personalCancerHistory Whether the person has a personal history of cancer.
 * @property {boolean|string|number} familyLungCancerHistory Whether the person has a family history of lung cancer.
 * @property {string} smokingStatus `current` or `former`.
 * @property {number|string} smokingIntensity Average cigarettes smoked per day.
 * @property {number|string} smokingDuration Duration smoked in years.
 * @property {number|string} quitYears Years since quitting. Use 0 for current smokers.
 */

/**
 * Normalised PLCOm2012 calculator input.
 *
 * @typedef {Object} NormalisedPlcoM2012Input
 * @property {number} age Age in years.
 * @property {string} ethnicity Canonical PLCO ethnicity group.
 * @property {number} education Education level from 1 to 6.
 * @property {number} bodyMassIndex Body mass index.
 * @property {boolean} copd Whether the person has COPD, emphysema or chronic bronchitis.
 * @property {boolean} personalCancerHistory Whether the person has a personal history of cancer.
 * @property {boolean} familyLungCancerHistory Whether the person has a family history of lung cancer.
 * @property {string} smokingStatus `current` or `former`.
 * @property {number} smokingIntensity Average cigarettes smoked per day.
 * @property {number} smokingDuration Duration smoked in years.
 * @property {number} quitYears Years since quitting.
 */

const requiredInputs = [
  'age',
  'ethnicity',
  'education',
  'bodyMassIndex',
  'copd',
  'personalCancerHistory',
  'familyLungCancerHistory',
  'smokingStatus',
  'smokingIntensity',
  'smokingDuration',
  'quitYears'
]

const sourceReferences = [
  {
    label: 'Tammemagi MC et al. Selection Criteria for Lung-Cancer Screening',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23425165/'
  },
  {
    label: 'PMCID PMC3929969 coefficient table',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3929969/'
  },
  {
    label: 'Local TLHC LLP PLCO combined tool workbook',
    path: 'docs/master-llpv2-plcom2102-combined-tool.xlsx'
  }
]

const calculationSpec = {
  status: 'implemented_for_prototype',
  caveat: prototypeCaveat,
  timeHorizonYears: 6,
  output: 'probability',
  thresholds: 'Not applied by this calculator. Configure thresholds in the prototype that uses the result.'
}

const coefficients = {
  intercept: -4.532506,
  age: 0.0778868,
  education: -0.0812744,
  bodyMassIndex: -0.0274194,
  copd: 0.3553063,
  personalCancerHistory: 0.4589971,
  familyLungCancerHistory: 0.587185,
  smokingStatusCurrent: 0.2597431,
  smokingIntensity: -1.822606,
  smokingDuration: 0.0317321,
  quitYears: -0.0308572,
  ethnicity: {
    white: 0,
    black: 0.3944778,
    hispanic: -0.7434744,
    asian: -0.466585,
    native_hawaiian_or_pacific_islander: 1.027152,
    american_indian_or_alaska_native: 0
  }
}

const ethnicityChoices = {
  white: 'white',
  british: 'white',
  irish: 'white',
  mixed: 'white',
  other: 'white',
  not_stated: 'white',
  black: 'black',
  black_non_hispanic: 'black',
  hispanic: 'hispanic',
  asian: 'asian',
  native_hawaiian_or_pacific_islander: 'native_hawaiian_or_pacific_islander',
  native_hawaiian: 'native_hawaiian_or_pacific_islander',
  pacific_islander: 'native_hawaiian_or_pacific_islander',
  american_indian_or_alaska_native: 'american_indian_or_alaska_native',
  american_indian: 'american_indian_or_alaska_native',
  alaskan_native: 'american_indian_or_alaska_native'
}

const nhsdEthnicityMap = {
  a: 'white',
  b: 'white',
  c: 'white',
  d: 'white',
  e: 'white',
  f: 'white',
  g: 'white',
  s: 'white',
  z: 'white',
  m: 'black',
  n: 'black',
  p: 'black',
  h: 'asian',
  j: 'asian',
  k: 'asian',
  l: 'asian',
  r: 'asian'
}

const educationChoices = {
  1: 1,
  less_than_high_school: 1,
  finished_school_at_or_before_15: 1,
  2: 2,
  high_school: 2,
  high_school_graduate: 2,
  gcses: 2,
  3: 3,
  post_high_school_training: 3,
  some_training_after_high_school: 3,
  a_levels: 3,
  a_levels_or_equivalent: 3,
  4: 4,
  some_college: 4,
  further_education: 4,
  further_education_but_not_a_degree: 4,
  5: 5,
  college_graduate: 5,
  bachelors_degree: 5,
  bachelors_degree_or_equivalent: 5,
  6: 6,
  postgraduate: 6,
  postgraduate_or_professional: 6,
  further_degree: 6
}

const smokingStatusChoices = {
  current: 'current',
  current_smoker: 'current',
  former: 'former',
  former_smoker: 'former',
  ex: 'former',
  ex_smoker: 'former'
}

/**
 * Normalise the PLCO education category into a number from 1 to 6.
 *
 * @param {Object} input Raw calculator input.
 * @param {import('./helpers').RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @returns {number|undefined} Canonical education category.
 */
const normaliseEducation = (input, errors) => {
  const education = choiceInput(input, ['education'], errors, educationChoices)

  if (education !== undefined && (!Number.isInteger(education) || education < 1 || education > 6)) {
    errors.push({ field: 'education', message: 'education must be an integer from 1 to 6.' })
  }

  return education
}

/**
 * Normalise PLCO ethnicity, including the NHS Digital ethnicity codes used by
 * the local combined-tool workbook.
 *
 * @param {Object} input Raw calculator input.
 * @param {import('./helpers').RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @returns {string|undefined} Canonical ethnicity group.
 */
const normaliseEthnicity = (input, errors) => {
  const token = normaliseToken(input.ethnicity)
  const mappedToken = nhsdEthnicityMap[token] || token

  if (!ethnicityChoices[mappedToken]) {
    errors.push({
      field: 'ethnicity',
      message: `ethnicity must be one of: ${Object.keys(coefficients.ethnicity).join(', ')}.`
    })
    return undefined
  }

  return ethnicityChoices[mappedToken]
}

/**
 * Validate and normalise raw PLCOm2012 input.
 *
 * @param {PlcoM2012Input} input Raw calculator input.
 * @returns {NormalisedPlcoM2012Input} Normalised input.
 * @throws {import('./input-error').RiskCalculatorInputError}
 */
const normaliseInputs = (input) => {
  const errors = []

  if (!input || typeof input !== 'object') {
    throwIfInputErrors(id, [{ field: 'input', message: 'input must be an object.' }])
  }

  const normalised = {
    age: numberInput(input, ['age'], errors, { min: 15, max: 115 }),
    ethnicity: normaliseEthnicity(input, errors),
    education: normaliseEducation(input, errors),
    bodyMassIndex: numberInput(input, ['bodyMassIndex', 'bmi'], errors, { min: 1 }),
    copd: booleanInput(input, ['copd'], errors),
    personalCancerHistory: booleanInput(input, ['personalCancerHistory', 'previousCancer'], errors),
    familyLungCancerHistory: booleanInput(input, ['familyLungCancerHistory'], errors),
    smokingStatus: choiceInput(input, ['smokingStatus'], errors, smokingStatusChoices),
    smokingIntensity: numberInput(input, ['smokingIntensity', 'cigarettesPerDay'], errors, { min: 1, max: 280 }),
    smokingDuration: numberInput(input, ['smokingDuration'], errors, { min: 0 }),
    quitYears: numberInput(input, ['quitYears', 'yearsQuit'], errors, { min: 0 })
  }

  if (
    normalised.age !== undefined &&
    normalised.smokingDuration !== undefined &&
    normalised.smokingDuration > normalised.age
  ) {
    errors.push({ field: 'smokingDuration', message: 'smokingDuration must not be greater than age.' })
  }

  if (normalised.age !== undefined && normalised.quitYears !== undefined && normalised.quitYears > normalised.age) {
    errors.push({ field: 'quitYears', message: 'quitYears must not be greater than age.' })
  }

  throwIfInputErrors(id, errors)

  return normalised
}

/**
 * Calculate PLCOm2012 6-year lung cancer risk.
 *
 * The function returns the risk score only. It does not apply service or
 * prototype eligibility thresholds.
 *
 * @param {PlcoM2012Input} input Raw calculator input.
 * @returns {import('./helpers').RiskCalculatorResult} Risk result.
 * @throws {import('./input-error').RiskCalculatorInputError}
 */
const calculate = (input) => {
  const normalised = normaliseInputs(input)
  const smokingIntensityTransformed = ((normalised.smokingIntensity / 10) ** -1) - 0.4021541613
  const contributions = {
    age: (normalised.age - 62) * coefficients.age,
    ethnicity: coefficients.ethnicity[normalised.ethnicity],
    education: (normalised.education - 4) * coefficients.education,
    bodyMassIndex: (normalised.bodyMassIndex - 27) * coefficients.bodyMassIndex,
    copd: normalised.copd ? coefficients.copd : 0,
    personalCancerHistory: normalised.personalCancerHistory ? coefficients.personalCancerHistory : 0,
    familyLungCancerHistory: normalised.familyLungCancerHistory ? coefficients.familyLungCancerHistory : 0,
    smokingStatus: normalised.smokingStatus === 'current' ? coefficients.smokingStatusCurrent : 0,
    smokingIntensity: smokingIntensityTransformed * coefficients.smokingIntensity,
    smokingDuration: (normalised.smokingDuration - 27) * coefficients.smokingDuration,
    quitYears: (normalised.quitYears - 10) * coefficients.quitYears,
    intercept: coefficients.intercept
  }

  const logit = Object.values(contributions).reduce((total, contribution) => total + contribution, 0)
  const probability = logistic(logit)

  return createRiskResult({
    id,
    name,
    probability,
    timeHorizonYears: 6,
    inputs: normalised,
    details: {
      logit,
      smokingIntensityTransformed,
      contributions
    }
  })
}

module.exports = {
  calculate,
  calculationSpec,
  coefficients,
  id,
  name,
  requiredInputs,
  sourceReferences
}
