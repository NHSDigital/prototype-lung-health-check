const { getQuestion } = require('./questions')

const isBlank = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return value === undefined || value === null || String(value).trim() === ''
}

const getAnswerValue = (answers = {}, question) => {
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

const makeError = (error) => {
  return {
    text: error.text,
    href: error.href
  }
}

const validateConditional = (answers, question, errors) => {
  const conditionalRules = question.validation?.conditional || {}
  const value = getAnswerValue(answers, question)

  Object.entries(conditionalRules).forEach(([triggerValue, rule]) => {
    if (value !== triggerValue || !rule.required) {
      return
    }

    if (isBlank(answers[rule.answerKey])) {
      const error = question.errors?.conditional?.[triggerValue]?.required || {
        text: 'Enter an answer',
        href: rule.href
      }

      errors.push(makeError(error))
    }
  })
}

const validateQuestion = (answers = {}, id) => {
  const question = getQuestion(id)
  const validation = question.validation || {}
  const errors = []

  if (!validation.required && !validation.type && !validation.conditional) {
    return errors
  }

  if (validation.type === 'date') {
    const value = getDateValue(answers, question)
    const hasAnyDatePart = [value.day, value.month, value.year].some((item) => !isBlank(item))

    if (validation.required && !hasAnyDatePart) {
      errors.push(makeError(question.errors.required))
      return errors
    }

    if (hasAnyDatePart && !isRealDate(value)) {
      errors.push(makeError(question.errors.invalid))
    }

    return errors
  }

  const value = getAnswerValue(answers, question)

  if (validation.required && isBlank(value)) {
    errors.push(makeError(question.errors.required))
    return errors
  }

  if (validation.type === 'number' && !isBlank(value) && Number.isNaN(Number(value))) {
    errors.push(makeError(question.errors.invalid))
  }

  validateConditional(answers, question, errors)

  return errors
}

module.exports = {
  validateQuestion
}
