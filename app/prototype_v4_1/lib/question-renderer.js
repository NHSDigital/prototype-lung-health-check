const { getQuestion } = require('./questions')

const version = 'v4_1'

/**
 * Build a prototype v4_1 view path.
 *
 * @param {string} template - Template path below the prototype views folder.
 * @returns {string} Nunjucks template path.
 */
const view = (template) => {
  return `prototype_${version}/views/${template}`
}

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
  const question = getQuestion(id)
  const errorMap = errors.reduce((map, error) => {
    if (error.href) {
      map[error.href.replace('#', '')] = error
    }

    return map
  }, {})

  res.render(view('questions/_question'), {
    question: {
      ...question,
      ...overrides,
      heading: {
        ...question.heading,
        ...overrides.heading
      },
      input: {
        ...question.input,
        ...overrides.input
      }
    },
    errorMap,
    errors,
    actions
  })
}

module.exports = {
  renderQuestion,
  version,
  view
}
