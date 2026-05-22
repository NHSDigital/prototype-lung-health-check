const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { getQuestion } = require('./questions')

const pagesPath = path.join(__dirname, '../data/pages.yaml')
const pages = {}
let loadedAt

const loadYaml = (filePath) => {
  const file = fs.readFileSync(filePath, 'utf8')
  return yaml.load(file) || {}
}

const refreshPages = (force = false) => {
  const mtime = fs.statSync(pagesPath).mtimeMs

  if (!force && mtime === loadedAt) {
    return
  }

  Object.keys(pages).forEach((key) => {
    delete pages[key]
  })

  ;(loadYaml(pagesPath).pages || []).forEach((page) => {
    pages[page.id] = page
  })

  loadedAt = mtime
}

refreshPages(true)

const getQuestionHeading = (question) => {
  if (!question.input?.label) {
    return undefined
  }

  return {
    title: question.input.label,
    caption: question.input.caption
  }
}

const normaliseQuestionRef = (item) => {
  return typeof item === 'string' ? { id: item } : item
}

const getCondition = (questionRef) => {
  return questionRef.if || questionRef.showIf || questionRef.condition
}

const getNestedAnswerValues = (answers = {}, answerKey) => {
  return Object.values(answers).flatMap((answer) => {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      return []
    }

    return answer[answerKey] === undefined ? [] : [answer[answerKey]]
  })
}

const getAnswer = (answers = {}, answerKey) => {
  if (answers[answerKey] !== undefined) {
    return answers[answerKey]
  }

  const nestedValues = getNestedAnswerValues(answers, answerKey)

  return nestedValues.length ? nestedValues : undefined
}

const getConditionAnswer = (condition = {}, answers = {}) => {
  if (condition.answerKey) {
    return getAnswer(answers, condition.answerKey)
  }

  if (condition.answer) {
    return getAnswer(answers, condition.answer)
  }

  if (condition.question) {
    return getAnswer(answers, getQuestion(condition.question).answerKey)
  }

  return undefined
}

const hasValue = (actual, expected) => {
  if (Array.isArray(expected)) {
    return expected.some((value) => hasValue(actual, value))
  }

  if (Array.isArray(actual)) {
    return actual.includes(expected)
  }

  return actual === expected
}

const matchesConditionRule = (condition, answers = {}) => {
  if (!condition) {
    return true
  }

  if (Array.isArray(condition.any)) {
    return condition.any.some((rule) => matchesConditionRule(rule, answers))
  }

  if (Array.isArray(condition.all)) {
    return condition.all.every((rule) => matchesConditionRule(rule, answers))
  }

  const actual = getConditionAnswer(condition, answers)

  if (condition.is !== undefined) {
    return hasValue(actual, condition.is)
  }

  if (condition.equals !== undefined) {
    return hasValue(actual, condition.equals)
  }

  if (condition.includes !== undefined) {
    return hasValue(actual, condition.includes)
  }

  if (condition.not !== undefined) {
    return !hasValue(actual, condition.not)
  }

  if (condition.excludes !== undefined) {
    return !hasValue(actual, condition.excludes)
  }

  return true
}

const matchesCondition = (questionRef, answers = {}) => {
  return matchesConditionRule(getCondition(questionRef), answers)
}

const mergeQuestionWithPageContent = (question, pageContent = {}, options = {}) => {
  const isSingleQuestionPage = options.isSingleQuestionPage === true
  const hasPageHeading = Boolean(options.pageHeading?.title)
  const heading = pageContent.heading
    ? {
        ...getQuestionHeading(question),
        ...pageContent.heading
      }
    : getQuestionHeading(question)
  const input = {
    ...question.input
  }

  if (isSingleQuestionPage && !hasPageHeading && heading?.title) {
    input.label = heading.title
    input.isPageHeading = true
  } else if (heading?.title && !input.label) {
    input.label = heading.title
    input.isPageHeading = false
  } else if (!isSingleQuestionPage) {
    input.isPageHeading = false
  }

  return {
    ...question,
    heading,
    description: pageContent.description !== undefined ? pageContent.description : question.description,
    details: pageContent.details !== undefined ? pageContent.details : question.details,
    input,
    page: {
      heading,
      description: pageContent.description !== undefined ? pageContent.description : question.description,
      details: pageContent.details !== undefined ? pageContent.details : question.details
    }
  }
}

const getQuestionPage = (id, answers = {}) => {
  refreshPages()

  const page = pages[id]

  if (!page) {
    throw new Error(`Question page not found: ${id}`)
  }

  const pageQuestions = page.questions || []
  const visiblePageQuestions = pageQuestions
    .map(normaliseQuestionRef)
    .filter((questionRef) => matchesCondition(questionRef, answers))
  const questions = visiblePageQuestions.map((questionRef) => {
    const question = getQuestion(questionRef.id)
    const isSingleQuestionPage = visiblePageQuestions.length === 1
    const pageContent = visiblePageQuestions.length === 1
      ? {
          ...questionRef
        }
      : questionRef

    return mergeQuestionWithPageContent(question, pageContent, {
      isSingleQuestionPage,
      pageHeading: page.heading
    })
  })
  const firstQuestion = questions[0]
  const heading = page.heading
    ? {
        ...firstQuestion?.page?.heading,
        ...page.heading
      }
    : firstQuestion?.page?.heading

  return {
    ...page,
    heading,
    description: page.description !== undefined
      ? page.description
      : visiblePageQuestions.length === 1 ? firstQuestion?.page?.description : undefined,
    details: page.details !== undefined
      ? page.details
      : visiblePageQuestions.length === 1 ? firstQuestion?.page?.details : undefined,
    questions
  }
}

module.exports = {
  getQuestionPage,
  refreshPages
}
