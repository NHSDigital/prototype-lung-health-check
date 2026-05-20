const { getQuestion } = require('./questions')
const { getQuestionPage } = require('./question-pages')
const settings = require('./settings')

const { version, view } = settings

/**
 * Render a YAML-backed question using optional runtime overrides.
 *
 * @param {Object} res - Express response object.
 * @param {string} id - Question id from questions.yaml.
 * @param {Object} actions - URLs used by the generic question template.
 * @param {Object[]} [errors] - Validation errors for the question.
 * @param {Object} [overrides] - Runtime overrides for dynamic question content.
 */
const renderQuestion = (res, id, actions, errors = [], overrides = {}) => {
  const page = getQuestionPage(id)
  const question = page.questions[0] || getQuestion(id)
  const heading = {
    ...page.heading,
    ...overrides.heading
  }
  const input = {
    ...question.input,
    ...overrides.input
  }

  if (overrides.input?.label) {
    if (!heading.title) {
      heading.title = overrides.input.label
    }

    if (input.isPageHeading) {
      input.label = overrides.input.label
    }
  }

  res.render(view('questions/_question'), {
    question: {
      ...question,
      ...overrides,
      heading,
      description: overrides.description !== undefined ? overrides.description : page.description,
      details: overrides.details !== undefined ? overrides.details : page.details,
      input
    },
    errorMap: getErrorMap(errors),
    errors,
    actions
  })
}

const getErrorMap = (errors = []) => {
  return errors.reduce((map, error) => {
    if (error.href) {
      map[error.href.replace('#', '')] = error
    }

    return map
  }, {})
}

/**
 * Render a YAML-backed page containing one or more questions.
 *
 * @param {Object} res - Express response object.
 * @param {string} id - Page id from pages.yaml.
 * @param {Object} actions - URLs used by the grouped question template.
 * @param {Object[]} [errors] - Validation errors for all questions on the page.
 */
const renderQuestionPage = (res, id, actions, errors = []) => {
  res.render(view('questions/_question-page'), {
    page: getQuestionPage(id),
    errorMap: getErrorMap(errors),
    errors,
    actions
  })
}

module.exports = {
  renderQuestion,
  renderQuestionPage,
  version,
  view
}
