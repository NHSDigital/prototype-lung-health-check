const hasValue = (value) => value !== undefined && value !== null && value !== ''

const toNumber = (value) => {
  if (!hasValue(value)) {
    return undefined
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : undefined
}

const roundTo = (value, decimalPlaces) => {
  const multiplier = 10 ** decimalPlaces
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

/**
 * Convert date answer parts into a Date object.
 *
 * @param {Object} dateParts Date answer parts keyed by day, month and year.
 * @returns {Date|undefined} Date, or undefined when invalid.
 */
const dateFromParts = (dateParts = {}) => {
  const day = toNumber(dateParts.day)
  const month = toNumber(dateParts.month)
  const year = toNumber(dateParts.year)

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return undefined
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

/**
 * Calculate age in years.
 *
 * @param {Date} dateOfBirth Date of birth.
 * @param {Date} [referenceDate] Date to calculate age at.
 * @returns {number|undefined} Age in whole years.
 */
const calculateAge = (dateOfBirth, referenceDate = new Date()) => {
  if (!(dateOfBirth instanceof Date) || Number.isNaN(dateOfBirth.getTime())) {
    return undefined
  }

  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = referenceDate.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Convert prototype height answers to metres.
 *
 * @param {Object} height Height answer object.
 * @returns {number|undefined} Height in metres.
 */
const heightToMetres = (height = {}) => {
  const centimetres = toNumber(height.metric)

  if (centimetres !== undefined) {
    return centimetres / 100
  }

  const feet = toNumber(height.imperial?.feet)
  const inches = toNumber(height.imperial?.inches)

  if (feet !== undefined || inches !== undefined) {
    return ((feet || 0) * 12 + (inches || 0)) * 0.0254
  }

  return undefined
}

/**
 * Convert prototype weight answers to kilograms.
 *
 * @param {Object} weight Weight answer object.
 * @returns {number|undefined} Weight in kilograms.
 */
const weightToKilograms = (weight = {}) => {
  const kilograms = toNumber(weight.metric)

  if (kilograms !== undefined) {
    return kilograms
  }

  const stones = toNumber(weight.imperial?.stones)
  const pounds = toNumber(weight.imperial?.pounds)

  if (stones !== undefined || pounds !== undefined) {
    return ((stones || 0) * 14 + (pounds || 0)) * 0.45359237
  }

  return undefined
}

/**
 * Calculate BMI from metric height and weight.
 *
 * @param {Object} params Height and weight inputs.
 * @param {number} params.heightMetres Height in metres.
 * @param {number} params.weightKilograms Weight in kilograms.
 * @param {number} [params.decimalPlaces] Decimal places for output.
 * @returns {number|undefined} BMI.
 */
const calculateBmi = ({ heightMetres, weightKilograms, decimalPlaces = 1 } = {}) => {
  if (!heightMetres || !weightKilograms) {
    return undefined
  }

  const bmi = weightKilograms / (heightMetres ** 2)

  return Number.isFinite(bmi) ? roundTo(bmi, decimalPlaces) : undefined
}

/**
 * Convert prototype height and weight answers to BMI.
 *
 * @param {Object} answers Prototype answers object.
 * @param {number} [decimalPlaces] Decimal places for output.
 * @returns {number|undefined} BMI.
 */
const bmiFromAnswers = (answers = {}, decimalPlaces = 1) => {
  return calculateBmi({
    heightMetres: heightToMetres(answers.height),
    weightKilograms: weightToKilograms(answers.weight),
    decimalPlaces
  })
}

module.exports = {
  bmiFromAnswers,
  calculateAge,
  calculateBmi,
  dateFromParts,
  heightToMetres,
  toNumber,
  weightToKilograms
}
