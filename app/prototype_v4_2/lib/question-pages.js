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
    title: question.input.label
  }
}

const mergeQuestionWithPageContent = (question, pageContent = {}, options = {}) => {
  const isSingleQuestionPage = options.isSingleQuestionPage === true
  const hasPageHeading = Boolean(options.pageHeading?.title)
  const heading = pageContent.heading || getQuestionHeading(question)
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

const getQuestionPage = (id) => {
  refreshPages()

  const page = pages[id]

  if (!page) {
    throw new Error(`Question page not found: ${id}`)
  }

  const pageQuestions = page.questions || []
  const questions = pageQuestions.map((item) => {
    const questionRef = typeof item === 'string' ? { id: item } : item
    const question = getQuestion(questionRef.id)
    const isSingleQuestionPage = pageQuestions.length === 1
    const pageContent = pageQuestions.length === 1
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

  return {
    ...page,
    heading: page.heading || firstQuestion?.page?.heading,
    description: page.description !== undefined
      ? page.description
      : pageQuestions.length === 1 ? firstQuestion?.page?.description : undefined,
    details: page.details !== undefined
      ? page.details
      : pageQuestions.length === 1 ? firstQuestion?.page?.details : undefined,
    questions
  }
}

module.exports = {
  getQuestionPage,
  refreshPages
}
