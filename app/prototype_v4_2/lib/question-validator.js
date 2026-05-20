const { getQuestion } = require('./questions')

/**
 * @typedef {Object} ValidationError
 * @property {string} text - Error message shown in the summary and field.
 * @property {string} href - Fragment link to the invalid input.
 */

/**
 * @typedef {Object} QuestionValidation
 * @property {boolean} [required] - Whether the answer must be present.
 * @property {string} [type] - Type-specific validation, for example number or date.
 * @property {number} [min] - Minimum numeric value.
 * @property {number} [max] - Maximum numeric value.
 * @property {Object} [conditional] - Conditional reveal validation rules.
 * @property {Object[]} [items] - Validation rules for grouped inputs.
 */

/**
 * Check whether a submitted answer should be treated as empty.
 *
 * @param {*} value - Submitted answer value.
 * @returns {boolean} True when the value is missing or blank.
 */
const isBlank = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return value === undefined || value === null || String(value).trim() === ''
}

/**
 * Resolve the submitted value for a question, including overridden values.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} question - Normalised question config.
 * @returns {*} Submitted value for validation.
 */
const getAnswerValue = (answers = {}, question) => {
  if (question.values !== undefined) {
    return question.values
  }

  if (question.value !== undefined) {
    return question.value
  }

  const value = answers[question.answerKey]

  if (question.input?.valueKey) {
    return value?.[question.input.valueKey]
  }

  return value
}

/**
 * Resolve a conditional reveal value from a runtime override or answer key.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} rule - Conditional validation rule.
 * @returns {*} Submitted conditional value.
 */
const getConditionalValue = (answers = {}, rule = {}) => {
  if (rule.value !== undefined) {
    return rule.value
  }

  return answers[rule.answerKey]
}

/**
 * Resolve a date input value from the answers object.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} question - Normalised date question config.
 * @returns {Object} Date parts keyed by day, month and year.
 */
const getDateValue = (answers = {}, question) => {
  return answers[question.answerKey] || {}
}

/**
 * Check whether day, month and year represent a real calendar date.
 *
 * @param {Object} value - Date parts keyed by day, month and year.
 * @returns {boolean} True when the date parts form a valid date.
 */
const isRealDate = (value = {}) => {
  const day = Number(value.day)
  const month = Number(value.month)
  const year = Number(value.year)

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false
  }

  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
}

/**
 * Get the default input href for a question-level error.
 *
 * @param {Object} question - Normalised question config.
 * @returns {string} Fragment link for the first invalid input.
 */
const getDefaultErrorHref = (question) => {
  return `#${question.input?.id || question.id}`
}

/**
 * Build a validation error, filling in a default href when needed.
 *
 * @param {Object} error - Error content from YAML or overrides.
 * @param {string} defaultHref - Fallback fragment link.
 * @returns {ValidationError} Normalised validation error.
 */
const makeError = (error, defaultHref) => {
  return {
    text: error.text,
    href: error.href || defaultHref
  }
}

/**
 * Validate conditional reveal inputs for selected trigger options.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} question - Normalised question config.
 * @param {ValidationError[]} errors - Mutable error collection.
 */
const validateConditional = (answers, question, errors) => {
  const conditionalRules = question.validation?.conditional || {}
  const value = getAnswerValue(answers, question)

  Object.entries(conditionalRules).forEach(([triggerValue, rule]) => {
    if (value !== triggerValue || !rule.required) {
      return
    }

    const conditionalValue = getConditionalValue(answers, rule)

    if (isBlank(conditionalValue)) {
      const error = question.errors?.conditional?.[triggerValue]?.required || {
        text: 'Enter an answer',
        href: rule.href
      }

      errors.push(makeError(error, rule.href))
      return
    }

    if (rule.type === 'number') {
      validateNumber(conditionalValue, rule, question.errors, errors, rule.href)
    }
  })
}

/**
 * Merge runtime overrides, such as tobacco-specific headings, into a question.
 *
 * @param {Object} question - Normalised question config.
 * @param {Object} overrides - Runtime question overrides.
 * @returns {Object} Merged question config.
 */
const mergeQuestion = (question, overrides = {}) => {
  return {
    ...question,
    ...overrides,
    heading: {
      ...question.heading,
      ...overrides.heading
    },
    input: {
      ...question.input,
      ...overrides.input
    },
    errors: {
      ...question.errors,
      ...overrides.errors
    },
    validation: {
      ...question.validation,
      ...overrides.validation
    }
  }
}

/**
 * Validate a numeric value against invalid, min and max rules.
 *
 * @param {*} value - Submitted value.
 * @param {QuestionValidation} validation - Numeric validation config.
 * @param {Object} errorsConfig - Error messages keyed by validation rule.
 * @param {ValidationError[]} errors - Mutable error collection.
 * @param {string} defaultHref - Fallback fragment link.
 */
const validateNumber = (value, validation, errorsConfig, errors, defaultHref) => {
  const number = Number(value)

  if (Number.isNaN(number)) {
    errors.push(makeError(errorsConfig.invalid, defaultHref))
    return
  }

  if (validation.min !== undefined && number < validation.min) {
    errors.push(makeError(errorsConfig.min, defaultHref))
  }

  if (validation.max !== undefined && number > validation.max) {
    errors.push(makeError(errorsConfig.max, defaultHref))
  }
}

/**
 * Validate grouped inputs, such as imperial height or weight fields.
 *
 * @param {Object} answers - Session answers object.
 * @param {Object} question - Normalised text_group question config.
 * @returns {ValidationError[]} Validation errors.
 */
const validateInputGroup = (answers, question) => {
  const errors = []
  const groupValue = answers[question.answerKey]?.[question.input.valueKey] || {}

  ;(question.validation?.items || []).forEach((itemValidation) => {
    const value = groupValue[itemValidation.answerKey]
    const itemErrors = question.errors?.items?.[itemValidation.answerKey] || {}
    const defaultHref = `#${itemValidation.id || itemValidation.answerKey}`

    if (itemValidation.required && isBlank(value)) {
      errors.push(makeError(itemErrors.required, defaultHref))
      return
    }

    if (itemValidation.type === 'number' && !isBlank(value)) {
      validateNumber(value, itemValidation, itemErrors, errors, defaultHref)
    }
  })

  return errors
}

/**
 * Validate a question using its YAML validation rules and runtime overrides.
 *
 * @param {Object} answers - Session answers object.
 * @param {string} id - Question id.
 * @param {Object} [overrides] - Runtime question overrides.
 * @returns {ValidationError[]} Validation errors.
 */
const validateQuestion = (answers = {}, id, overrides = {}) => {
  const question = mergeQuestion(getQuestion(id), overrides)
  const validation = question.validation || {}
  const errors = []
  const defaultHref = getDefaultErrorHref(question)

  if (!validation.required && !validation.type && !validation.conditional && !validation.items) {
    return errors
  }

  if (question.type === 'text_group') {
    return validateInputGroup(answers, question)
  }

  if (validation.type === 'date') {
    const value = getDateValue(answers, question)
    const hasAnyDatePart = [value.day, value.month, value.year].some((item) => !isBlank(item))

    if (validation.required && !hasAnyDatePart) {
      errors.push(makeError(question.errors.required, defaultHref))
      return errors
    }

    if (hasAnyDatePart && !isRealDate(value)) {
      errors.push(makeError(question.errors.invalid, defaultHref))
    }

    return errors
  }

  const value = getAnswerValue(answers, question)

  if (validation.required && isBlank(value)) {
    errors.push(makeError(question.errors.required, defaultHref))
    return errors
  }

  if (question.type === 'text' && validation.type === 'number' && !isBlank(value)) {
    validateNumber(value, validation, question.errors, errors, defaultHref)
  }

  validateConditional(answers, question, errors)

  return errors
}

/**
 * Validate several questions using the same rules as individual pages.
 *
 * @param {Object} answers - Session answers object.
 * @param {string[]} ids - Question ids to validate.
 * @returns {ValidationError[]} Validation errors for all questions.
 */
const validateQuestions = (answers = {}, ids = []) => {
  return ids.flatMap((id) => validateQuestion(answers, id))
}

module.exports = {
  validateQuestion,
  validateQuestions
}
