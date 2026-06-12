const {
  booleanInput,
  createRiskResult,
  getInputValue,
  logistic,
  normaliseToken,
  numberInput,
  prototypeCaveat,
  throwIfInputErrors
} = require('./helpers')

const id = 'llpv2'
const name = 'LLPv2'

/**
 * Raw LLPv2 calculator input.
 *
 * @typedef {Object} LLPv2Input
 * @property {number|string} age Age in whole years.
 * @property {string} sex `male` or `female`.
 * @property {number|string} smokingDuration Duration smoked in years.
 * @property {boolean|string|number} previousPneumonia Whether the person has had pneumonia.
 * @property {boolean|string|number} asbestosExposure Whether the person has been exposed to asbestos.
 * @property {boolean|string|number} copd Whether the person has COPD.
 * @property {boolean|string|number} emphysema Whether the person has emphysema.
 * @property {boolean|string|number} bronchitis Whether the person has bronchitis.
 * @property {boolean|string|number} tuberculosis Whether the person has had tuberculosis.
 * @property {boolean|string|number} personalCancerHistory Whether the person has a personal history of cancer.
 * @property {string|boolean|number} familyLungCancerHistory Family lung cancer history: `none`, `early_onset` or `late_onset`.
 * @property {boolean|string|number} [relativeDiagnosedBefore60] Whether a relative was diagnosed before 60 when family history is boolean true.
 */

/**
 * Normalised LLPv2 calculator input.
 *
 * @typedef {Object} NormalisedLLPv2Input
 * @property {number} age Age in whole years.
 * @property {string} sex `male` or `female`.
 * @property {number} smokingDuration Duration smoked in years.
 * @property {boolean} previousPneumonia Whether the person has had pneumonia.
 * @property {boolean} asbestosExposure Whether the person has been exposed to asbestos.
 * @property {boolean} copd Whether the person has COPD.
 * @property {boolean} emphysema Whether the person has emphysema.
 * @property {boolean} bronchitis Whether the person has bronchitis.
 * @property {boolean} tuberculosis Whether the person has had tuberculosis.
 * @property {boolean} personalCancerHistory Whether the person has a personal history of cancer.
 * @property {string} familyLungCancerHistory Canonical family history category.
 */

const requiredInputs = [
  'age',
  'sex',
  'smokingDuration',
  'previousPneumonia',
  'asbestosExposure',
  'copd',
  'emphysema',
  'bronchitis',
  'tuberculosis',
  'personalCancerHistory',
  'familyLungCancerHistory'
]

const sourceReferences = [
  {
    label: 'Field JK et al. Liverpool Lung Project lung cancer risk stratification model',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33082166/'
  },
  {
    label: 'Raji OY et al. Predictive accuracy of the Liverpool Lung Project risk model',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22910935/'
  },
  {
    label: 'Local TLHC LLP PLCO combined tool workbook',
    path: 'docs/master-llpv2-plcom2102-combined-tool.xlsx'
  }
]

const calculationSpec = {
  status: 'implemented_for_prototype',
  caveat: prototypeCaveat,
  timeHorizonYears: 5,
  output: 'probability',
  thresholds: 'Not applied by this calculator. Configure thresholds in the prototype that uses the result.'
}

const coefficients = {
  smokingDuration: {
    never: 0,
    years1To19: 0.7692,
    years20To39: 1.4516,
    years40To59: 2.5072,
    years60OrMore: 2.72434
  },
  anyLungConditionOrCancer: 0.6025,
  asbestosExposure: 0.6343,
  previousPneumonia: 0.6754,
  familyLungCancerHistory: {
    none: 0,
    earlyOnset: 0.7034,
    lateOnset: 0.1677
  }
}

const baselineLogits = {
  40: { male: -9.06, female: -9.9 },
  45: { male: -8.16, female: -8.06 },
  50: { male: -7.31, female: -7.46 },
  55: { male: -6.63, female: -6.5 },
  60: { male: -5.97, female: -6.22 },
  65: { male: -5.56, female: -5.99 },
  70: { male: -5.31, female: -5.49 },
  75: { male: -4.83, female: -5.23 },
  80: { male: -4.68, female: -5.42 }
}

const sexChoices = {
  male: 'male',
  m: 'male',
  female: 'female',
  f: 'female'
}

const familyHistoryChoices = {
  0: 'none',
  no: 'none',
  none: 'none',
  false: 'none',
  1: 'earlyOnset',
  early: 'earlyOnset',
  early_onset: 'earlyOnset',
  before_60: 'earlyOnset',
  under_60: 'earlyOnset',
  younger_than_60: 'earlyOnset',
  2: 'lateOnset',
  late: 'lateOnset',
  late_onset: 'lateOnset',
  over_60: 'lateOnset',
  older_than_60: 'lateOnset',
  age_60_or_older: 'lateOnset',
  '60_or_older': 'lateOnset'
}

/**
 * Normalise sex into the two categories used by the LLPv2 workbook.
 *
 * @param {Object} input Raw calculator input.
 * @param {import('./helpers').RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @returns {string|undefined} Canonical sex value.
 */
const normaliseSex = (input, errors) => {
  const value = getInputValue(input, ['sex', 'gender'])

  if (value === undefined) {
    errors.push({ field: 'sex', message: 'sex is required.' })
    return undefined
  }

  const sex = sexChoices[normaliseToken(value)]

  if (!sex) {
    errors.push({ field: 'sex', message: 'sex must be male or female.' })
    return undefined
  }

  return sex
}

/**
 * Normalise family history into the workbook's none, early-onset or late-onset
 * categories.
 *
 * @param {Object} input Raw calculator input.
 * @param {import('./helpers').RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @returns {string|undefined} Canonical family history category.
 */
const normaliseFamilyHistory = (input, errors) => {
  const value = getInputValue(input, ['familyLungCancerHistory'])

  if (value === undefined) {
    errors.push({ field: 'familyLungCancerHistory', message: 'familyLungCancerHistory is required.' })
    return undefined
  }

  if (typeof value === 'boolean') {
    if (!value) {
      return 'none'
    }

    const relativeDiagnosedBefore60 = getInputValue(input, ['relativeDiagnosedBefore60'])

    if (relativeDiagnosedBefore60 === undefined) {
      errors.push({
        field: 'relativeDiagnosedBefore60',
        message: 'relativeDiagnosedBefore60 is required when familyLungCancerHistory is true.'
      })
      return undefined
    }

    const token = normaliseToken(relativeDiagnosedBefore60)

    if (['true', 'yes', 'y', '1'].includes(token)) {
      return 'earlyOnset'
    }

    if (['false', 'no', 'n', '0', '2'].includes(token)) {
      return 'lateOnset'
    }

    errors.push({
      field: 'relativeDiagnosedBefore60',
      message: 'relativeDiagnosedBefore60 must be true or false.'
    })
    return undefined
  }

  const familyHistory = familyHistoryChoices[normaliseToken(value)]

  if (!familyHistory) {
    errors.push({
      field: 'familyLungCancerHistory',
      message: 'familyLungCancerHistory must be none, early_onset or late_onset.'
    })
    return undefined
  }

  return familyHistory
}

/**
 * Convert smoking duration in years into the LLPv2 workbook band.
 *
 * @param {number} duration Smoking duration in years.
 * @returns {string} Smoking-duration band key.
 */
const getSmokingDurationBand = (duration) => {
  if (duration === 0) {
    return 'never'
  }

  if (duration < 20) {
    return 'years1To19'
  }

  if (duration < 40) {
    return 'years20To39'
  }

  if (duration < 60) {
    return 'years40To59'
  }

  return 'years60OrMore'
}

/**
 * Get the age and sex baseline logit using the interpolation from the local
 * combined-tool workbook.
 *
 * @param {number} age Age in whole years from 40 to 84.
 * @param {string} sex Canonical sex value.
 * @returns {number} Baseline logit.
 */
const getBaselineLogit = (age, sex) => {
  const yearsIntoBand = age % 5
  const lowerBand = age - yearsIntoBand
  const upperBand = Math.min(lowerBand + 5, 80)
  const lowerWeight = 5 - yearsIntoBand - 0.5
  const upperWeight = yearsIntoBand + 0.5

  return (
    (lowerWeight * baselineLogits[lowerBand][sex]) +
    (upperWeight * baselineLogits[upperBand][sex])
  ) / 5
}

/**
 * Validate and normalise raw LLPv2 input.
 *
 * @param {LLPv2Input} input Raw calculator input.
 * @returns {NormalisedLLPv2Input} Normalised input.
 * @throws {import('./input-error').RiskCalculatorInputError}
 */
const normaliseInputs = (input) => {
  const errors = []

  if (!input || typeof input !== 'object') {
    throwIfInputErrors(id, [{ field: 'input', message: 'input must be an object.' }])
  }

  const normalised = {
    age: numberInput(input, ['age'], errors, { min: 40, max: 84, integer: true }),
    sex: normaliseSex(input, errors),
    smokingDuration: numberInput(input, ['smokingDuration'], errors, { min: 0 }),
    previousPneumonia: booleanInput(input, ['previousPneumonia', 'pneumonia'], errors, { oneTwo: true }),
    asbestosExposure: booleanInput(input, ['asbestosExposure'], errors, { oneTwo: true }),
    copd: booleanInput(input, ['copd'], errors, { oneTwo: true }),
    emphysema: booleanInput(input, ['emphysema'], errors, { oneTwo: true }),
    bronchitis: booleanInput(input, ['bronchitis'], errors, { oneTwo: true }),
    tuberculosis: booleanInput(input, ['tuberculosis', 'tb'], errors, { oneTwo: true }),
    personalCancerHistory: booleanInput(input, ['personalCancerHistory', 'previousCancer'], errors, { oneTwo: true }),
    familyLungCancerHistory: normaliseFamilyHistory(input, errors)
  }

  if (
    normalised.age !== undefined &&
    normalised.smokingDuration !== undefined &&
    normalised.smokingDuration > normalised.age
  ) {
    errors.push({ field: 'smokingDuration', message: 'smokingDuration must not be greater than age.' })
  }

  throwIfInputErrors(id, errors)

  return normalised
}

/**
 * Calculate LLPv2 5-year lung cancer risk.
 *
 * The function returns the risk score only. It does not apply service or
 * prototype eligibility thresholds.
 *
 * @param {LLPv2Input} input Raw calculator input.
 * @returns {import('./helpers').RiskCalculatorResult} Risk result.
 * @throws {import('./input-error').RiskCalculatorInputError}
 */
const calculate = (input) => {
  const normalised = normaliseInputs(input)
  const baselineLogit = getBaselineLogit(normalised.age, normalised.sex)
  const smokingDurationBand = getSmokingDurationBand(normalised.smokingDuration)
  const hasAnyLungConditionOrCancer = [
    normalised.copd,
    normalised.emphysema,
    normalised.bronchitis,
    normalised.tuberculosis,
    normalised.personalCancerHistory
  ].some(Boolean)

  const contributions = {
    smokingDuration: coefficients.smokingDuration[smokingDurationBand],
    anyLungConditionOrCancer: hasAnyLungConditionOrCancer ? coefficients.anyLungConditionOrCancer : 0,
    asbestosExposure: normalised.asbestosExposure ? coefficients.asbestosExposure : 0,
    previousPneumonia: normalised.previousPneumonia ? coefficients.previousPneumonia : 0,
    familyLungCancerHistory: coefficients.familyLungCancerHistory[normalised.familyLungCancerHistory]
  }

  const riskFactorLogit = Object.values(contributions).reduce((total, contribution) => total + contribution, 0)
  const logit = baselineLogit + riskFactorLogit
  const probability = logistic(logit)

  return createRiskResult({
    id,
    name,
    probability,
    timeHorizonYears: 5,
    inputs: {
      ...normalised,
      smokingDurationBand,
      anyLungConditionOrCancer: hasAnyLungConditionOrCancer
    },
    details: {
      baselineLogit,
      riskFactorLogit,
      logit,
      contributions
    }
  })
}

module.exports = {
  baselineLogits,
  calculate,
  calculationSpec,
  coefficients,
  id,
  name,
  requiredInputs,
  sourceReferences
}
