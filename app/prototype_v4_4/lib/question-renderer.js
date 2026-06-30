const { getQuestion } = require('./questions')
const { getQuestionPage } = require('./question-pages')
const settings = require('./settings')

const { version, view } = settings

const renderNunjucksData = (value, nunjucks, context) => {
  if (typeof value === 'string') {
    return nunjucks.renderString(value, context)
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderNunjucksData(item, nunjucks, context))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        renderNunjucksData(item, nunjucks, context)
      ])
    )
  }

  return value
}

const getRenderedPage = (req, res, id, answers = {}) => {
  const page = getQuestionPage(id, answers)
  const nunjucks = req.app.get('nunjucksEnv')

  return renderNunjucksData(page, nunjucks, {
    ...res.locals,
    page,
    data: req.session.data || {}
  })
}

const getAnswers = (req) => req.session.data?.answers || {}

const mergePageOverrides = (page, overrides = {}) => {
  return {
    ...page,
    ...overrides,
    heading: {
      ...page.heading,
      ...overrides.heading
    },
    button: {
      ...page.button,
      ...overrides.button
    },
    cancel: {
      ...page.cancel,
      ...overrides.cancel
    },
    summary: {
      ...page.summary,
      ...overrides.summary
    }
  }
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

  res.render(view('question-page'), {
    page: {
      ...page,
      heading,
      description: overrides.description !== undefined ? overrides.description : page.description,
      details: overrides.details !== undefined ? overrides.details : page.details,
      questions: [
        {
          ...question,
          ...overrides,
          heading,
          description: overrides.description !== undefined ? overrides.description : page.description,
          details: overrides.details !== undefined ? overrides.details : page.details,
          input
        }
      ]
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

const mergeQuestionOverrides = (question, overrides = {}) => {
  const heading = {
    ...question.heading,
    ...overrides.heading
  }
  const input = {
    ...question.input,
    ...overrides.input
  }

  if (overrides.heading?.title && !overrides.input?.label) {
    input.label = overrides.heading.title
  }

  return {
    ...question,
    ...overrides,
    heading,
    input,
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
 * Render a YAML-backed page containing one or more questions.
 *
 * @param {Object} res - Express response object.
 * @param {string} id - Page id from pages.yaml.
 * @param {Object} actions - URLs used by the grouped question template.
 * @param {Object[]} [errors] - Validation errors for all questions on the page.
 */
const renderQuestionPage = (res, id, actions, errors = [], answers = {}, overrides = {}) => {
  const page = getQuestionPage(id, answers)
  const questionOverrides = overrides.questions || {}

  res.render(view('question-page'), {
    page: {
      ...page,
      ...overrides,
      heading: {
        ...page.heading,
        ...overrides.heading
      },
      questions: page.questions.map((question) => mergeQuestionOverrides(question, questionOverrides[question.id]))
    },
    errorMap: getErrorMap(errors),
    errors,
    actions
  })
}

const renderInterstitialPage = (req, res, id, actions) => {
  const answers = getAnswers(req)

  res.render(view('interstitial-page'), {
    page: getRenderedPage(req, res, id, answers),
    actions
  })
}

const renderInterruptionPage = (req, res, id, actions) => {
  const answers = getAnswers(req)

  res.render(view('interruption-page'), {
    page: getRenderedPage(req, res, id, answers),
    actions
  })
}

const renderStopPage = (req, res, id, actions) => {
  const answers = getAnswers(req)

  res.render(view('stop-page'), {
    page: getRenderedPage(req, res, id, answers),
    actions
  })
}

const renderSummaryPage = (req, res, id, actions, overrides = {}) => {
  const { getSummaryPageSections } = require('./summary')
  const answers = getAnswers(req)
  const page = mergePageOverrides(getRenderedPage(req, res, id, answers), overrides)

  res.render(view('summary-page'), {
    page,
    summary: {
      sections: getSummaryPageSections(answers, page.summary)
    },
    actions
  })
}

module.exports = {
  renderInterruptionPage,
  renderInterstitialPage,
  renderQuestion,
  renderQuestionPage,
  renderStopPage,
  renderSummaryPage,
  version,
  view
}
