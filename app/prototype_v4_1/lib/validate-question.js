const { getQuestion } = require('./questions')

const isBlank = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return value === undefined || value === null || String(value).trim() === ''
}

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

const getDateValue = (answers = {}, question) => {
  return answers[question.answerKey] || {}
}

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

const getDefaultErrorHref = (question) => {
  return `#${question.input?.id || question.id}`
}

const makeError = (error, defaultHref) => {
  return {
    text: error.text,
    href: error.href || defaultHref
  }
}

const validateConditional = (answers, question, errors) => {
  const conditionalRules = question.validation?.conditional || {}
  const value = getAnswerValue(answers, question)

  Object.entries(conditionalRules).forEach(([triggerValue, rule]) => {
    if (value !== triggerValue || !rule.required) {
      return
    }

    const conditionalValue = answers[rule.answerKey]

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

const validateQuestion = (answers = {}, id, overrides = {}) => {
  const question = mergeQuestion(getQuestion(id), overrides)
  const validation = question.validation || {}
  const errors = []
  const defaultHref = getDefaultErrorHref(question)

  if (!validation.required && !validation.type && !validation.conditional && !validation.items) {
    return errors
  }

  if (question.type === 'input_group') {
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

  if (validation.type === 'number' && !isBlank(value)) {
    validateNumber(value, validation, question.errors, errors, defaultHref)
  }

  validateConditional(answers, question, errors)

  return errors
}

module.exports = {
  validateQuestion
}
