const { RiskCalculatorInputError } = require('./input-error')

/**
 * Field-level validation issue collected before throwing
 * `RiskCalculatorInputError`.
 *
 * @typedef {Object} RiskCalculatorFieldError
 * @property {string} field Input field that failed validation.
 * @property {string} message Human-readable validation message.
 */

/**
 * Standard result returned by all shared risk calculators.
 *
 * @typedef {Object} RiskCalculatorResult
 * @property {string} id Calculator ID.
 * @property {string} name Calculator display name.
 * @property {number} risk Probability from 0 to 1.
 * @property {number} probability Probability from 0 to 1.
 * @property {number} percent Probability expressed as a percentage.
 * @property {number} roundedPercent Percentage rounded to 2 decimal places.
 * @property {number} timeHorizonYears Risk time horizon in years.
 * @property {Object} inputs Normalised inputs used by the calculator.
 * @property {Object} details Calculator-specific intermediate values.
 * @property {string} caveat Prototype-only clinical caveat.
 */

const prototypeCaveat = 'Prototype only. Not clinically signed off. Do not use to make clinical decisions.'

const hasValue = (value) => value !== undefined && value !== null && value !== ''

/**
 * Return the first present input value for a list of accepted aliases.
 *
 * @param {Object} input Raw calculator input.
 * @param {string[]} names Field names to try in order.
 * @returns {*} First present value, or `undefined`.
 */
const getInputValue = (input, names) => {
  for (const name of names) {
    if (hasValue(input[name])) {
      return input[name]
    }
  }

  return undefined
}

/**
 * Normalise free-text tokens for lookup tables.
 *
 * @param {*} value Raw token.
 * @returns {string} Lowercase token with spaces and hyphens converted to `_`.
 */
const normaliseToken = (value) => String(value).trim().toLowerCase().replace(/[\s-]+/g, '_')

/**
 * Read and validate a numeric input.
 *
 * @param {Object} input Raw calculator input.
 * @param {string[]} names Field names to try in order.
 * @param {RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @param {Object} [options] Numeric validation options.
 * @param {number} [options.min] Minimum accepted value.
 * @param {number} [options.max] Maximum accepted value.
 * @param {boolean} [options.integer] Whether the value must be an integer.
 * @returns {number|undefined} Parsed number, or `undefined` if missing or invalid.
 */
const numberInput = (input, names, errors, options = {}) => {
  const field = names[0]
  const value = getInputValue(input, names)

  if (!hasValue(value)) {
    errors.push({ field, message: `${field} is required.` })
    return undefined
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    errors.push({ field, message: `${field} must be a number.` })
    return undefined
  }

  if (hasValue(options.min) && number < options.min) {
    errors.push({ field, message: `${field} must be at least ${options.min}.` })
  }

  if (hasValue(options.max) && number > options.max) {
    errors.push({ field, message: `${field} must be no more than ${options.max}.` })
  }

  if (options.integer && !Number.isInteger(number)) {
    errors.push({ field, message: `${field} must be a whole number.` })
  }

  return number
}

/**
 * Read and validate a boolean input.
 *
 * @param {Object} input Raw calculator input.
 * @param {string[]} names Field names to try in order.
 * @param {RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @param {Object} [options] Boolean validation options.
 * @param {boolean} [options.oneTwo] Whether `1` means yes and `2` means no.
 * @returns {boolean|undefined} Parsed boolean, or `undefined` if missing or invalid.
 */
const booleanInput = (input, names, errors, options = {}) => {
  const field = names[0]
  const value = getInputValue(input, names)

  if (!hasValue(value)) {
    errors.push({ field, message: `${field} is required.` })
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  const token = normaliseToken(value)

  if (['true', 'yes', 'y'].includes(token)) {
    return true
  }

  if (['false', 'no', 'n'].includes(token)) {
    return false
  }

  if (options.oneTwo && token === '1') {
    return true
  }

  if (options.oneTwo && token === '2') {
    return false
  }

  if (!options.oneTwo && token === '1') {
    return true
  }

  if (token === '0') {
    return false
  }

  errors.push({ field, message: `${field} must be true or false.` })
  return undefined
}

/**
 * Read and validate a categorical input.
 *
 * @param {Object} input Raw calculator input.
 * @param {string[]} names Field names to try in order.
 * @param {RiskCalculatorFieldError[]} errors Mutable validation error list.
 * @param {Object<string, *>} choices Lookup from normalised token to canonical value.
 * @returns {*} Canonical choice value, or `undefined` if missing or invalid.
 */
const choiceInput = (input, names, errors, choices) => {
  const field = names[0]
  const value = getInputValue(input, names)

  if (!hasValue(value)) {
    errors.push({ field, message: `${field} is required.` })
    return undefined
  }

  const token = normaliseToken(value)
  const choice = choices[token]

  if (!choice) {
    errors.push({
      field,
      message: `${field} must be one of: ${[...new Set(Object.values(choices))].join(', ')}.`
    })
    return undefined
  }

  return choice
}

/**
 * Throw a calculator input error if validation collected any errors.
 *
 * @param {string} calculatorId Calculator ID.
 * @param {RiskCalculatorFieldError[]} errors Validation errors.
 * @throws {RiskCalculatorInputError}
 */
const throwIfInputErrors = (calculatorId, errors) => {
  if (errors.length > 0) {
    throw new RiskCalculatorInputError(calculatorId, errors)
  }
}

/**
 * Logistic transform used by both risk models.
 *
 * @param {number} value Logit value.
 * @returns {number} Probability from 0 to 1.
 */
const logistic = (value) => 1 / (1 + Math.exp(-value))

/**
 * Round a number to a fixed number of decimal places.
 *
 * @param {number} value Number to round.
 * @param {number} decimalPlaces Decimal places.
 * @returns {number} Rounded number.
 */
const roundTo = (value, decimalPlaces) => {
  const multiplier = 10 ** decimalPlaces
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

/**
 * Create the standard calculator result object.
 *
 * @param {Object} params Result parameters.
 * @param {string} params.id Calculator ID.
 * @param {string} params.name Calculator display name.
 * @param {number} params.probability Probability from 0 to 1.
 * @param {number} params.timeHorizonYears Risk time horizon in years.
 * @param {Object} params.inputs Normalised inputs used by the calculator.
 * @param {Object} params.details Calculator-specific intermediate values.
 * @returns {RiskCalculatorResult} Standard calculator result.
 */
const createRiskResult = ({ id, name, probability, timeHorizonYears, inputs, details }) => {
  const percent = probability * 100

  return {
    id,
    name,
    risk: probability,
    probability,
    percent,
    roundedPercent: roundTo(percent, 2),
    timeHorizonYears,
    inputs,
    details,
    caveat: prototypeCaveat
  }
}

module.exports = {
  booleanInput,
  choiceInput,
  createRiskResult,
  getInputValue,
  logistic,
  normaliseToken,
  numberInput,
  prototypeCaveat,
  roundTo,
  throwIfInputErrors
}
