const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const questionsPath = path.join(__dirname, '../data/questions.yaml')
const tobaccoPath = path.join(__dirname, '../data/tobacco.yaml')

const loadYaml = (filePath) => {
  const file = fs.readFileSync(filePath, 'utf8')
  return yaml.load(file) || {}
}

const toAnswerName = (id) => {
  return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

const toComponentItem = (option) => {
  if (option.divider) {
    return {
      divider: option.divider
    }
  }

  return {
    text: option.label,
    hint: option.hint ? { text: option.hint } : undefined,
    value: option.value,
    exclusive: option.exclusive,
    exclusiveGroup: option.exclusiveGroup,
    conditionalInput: option.conditionalInput
  }
}

const normaliseQuestion = (question) => {
  const answerKey = question.answerKey || toAnswerName(question.id)
  const input = question.input || {}
  const label = input.label || question.heading?.title

  return {
    ...question,
    answerKey,
    input: {
      ...input,
      id: input.id || question.id,
      label,
      name: input.name || `answers[${answerKey}]`,
      hintParam: input.hint ? { text: input.hint } : undefined,
      isPageHeading: !input.label
    },
    items: (question.options || []).map(toComponentItem)
  }
}

const loadData = () => {
  const questionsData = loadYaml(questionsPath)
  const tobaccoData = loadYaml(tobaccoPath)
  const questions = (questionsData.questions || []).map(normaliseQuestion)

  return {
    questions: questions.reduce((index, question) => {
      index[question.id] = question
      return index
    }, {}),
    tobaccoTypes: tobaccoData.tobaccoTypes || {},
    smokingChangeTypes: tobaccoData.smokingChangeTypes || {},
    shishaSmokingSettings: tobaccoData.shishaSmokingSettings || {}
  }
}

const data = loadData()
const questions = data.questions

const getQuestion = (id) => {
  const question = questions[id]

  if (!question) {
    throw new Error(`Question not found: ${id}`)
  }

  return question
}

const getQuestionValueLabels = (id) => {
  const question = getQuestion(id)

  return (question.options || []).reduce((labels, option) => {
    if (option.value && option.label) {
      labels[option.value] = option.label
    }

    return labels
  }, {})
}

module.exports = {
  getQuestion,
  getQuestionValueLabels,
  smokingChangeTypes: data.smokingChangeTypes,
  shishaSmokingSettings: data.shishaSmokingSettings,
  tobaccoTypes: data.tobaccoTypes
}
