const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const questionsPath = path.join(__dirname, '../data/questions.yaml')
const tobaccoPath = path.join(__dirname, '../data/tobacco.yaml')
const data = {
  questions: {},
  smokingChangeTypes: {},
  shishaSmokingSettings: {},
  tobaccoTypes: {}
}
let loadedAt = {}

/**
 * @typedef {Object} QuestionOption
 * @property {string} [label] - Option label shown to the user.
 * @property {string} [hint] - Optional hint text shown under the label.
 * @property {string} [value] - Submitted option value.
 * @property {string} [divider] - Divider text, for example "or".
 * @property {boolean} [exclusive] - Whether the option clears other checkboxes.
 * @property {string} [exclusiveGroup] - Checkbox exclusive group name.
 * @property {Object} [conditionalInput] - Conditional reveal input config.
 */

/**
 * @typedef {Object} Question
 * @property {string} id - Stable question id used by routes and content lookup.
 * @property {string} type - Renderer type, for example single, multiple, text, date or text_group.
 * @property {string} answerKey - Key used in `req.session.data.answers`.
 * @property {Object} input - Normalised input config for NHS components.
 * @property {QuestionOption[]} [options] - Raw YAML options.
 * @property {Object[]} items - Options converted to NHS component items.
 */

/**
 * Load and parse a YAML file.
 *
 * @param {string} filePath - Absolute path to the YAML file.
 * @returns {Object} Parsed YAML object, or an empty object for blank files.
 */
const loadYaml = (filePath) => {
  const file = fs.readFileSync(filePath, 'utf8')
  return yaml.load(file) || {}
}

/**
 * Get a file's modification timestamp.
 *
 * @param {string} filePath - Absolute path to the file.
 * @returns {number} Modification timestamp in milliseconds.
 */
const getFileMtime = (filePath) => {
  return fs.statSync(filePath).mtimeMs
}

/**
 * Replace an object's keys without replacing the object reference.
 *
 * This keeps destructured imports of exported data objects up to date.
 *
 * @param {Object} target - Object to mutate.
 * @param {Object} source - Replacement key/value pairs.
 */
const replaceObject = (target, source = {}) => {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })

  Object.assign(target, source)
}

/**
 * Convert a kebab-case question id into the default camelCase answer key.
 *
 * @param {string} id - Question id, for example `date-of-birth`.
 * @returns {string} Answer key, for example `dateOfBirth`.
 */
const toAnswerName = (id) => {
  return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert a YAML option into the shape expected by NHS radios/checkboxes.
 *
 * @param {QuestionOption} option - YAML option definition.
 * @returns {Object} NHS component item.
 */
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

/**
 * Add derived fields used by the generic question renderer.
 *
 * @param {Question} question - Raw question loaded from YAML.
 * @returns {Question} Normalised question.
 */
const normaliseQuestion = (question) => {
  const answerKey = question.answerKey || toAnswerName(question.id)
  const input = question.input || {}

  return {
    ...question,
    answerKey,
    input: {
      ...input,
      id: input.id || question.id,
      label: input.label,
      name: input.name || `answers[${answerKey}]`,
      hintParam: input.hint ? { text: input.hint } : undefined,
      isPageHeading: !input.label
    },
    items: (question.options || []).map(toComponentItem)
  }
}

/**
 * Load all question and tobacco content files.
 *
 * @returns {Object} Indexed questions and tobacco content config.
 */
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

/**
 * Reload YAML content when either data file has changed.
 *
 * @param {boolean} [force] - Reload even when mtimes are unchanged.
 */
const refreshData = (force = false) => {
  const mtimes = {
    questions: getFileMtime(questionsPath),
    tobacco: getFileMtime(tobaccoPath)
  }
  const hasChanged = force ||
    mtimes.questions !== loadedAt.questions ||
    mtimes.tobacco !== loadedAt.tobacco

  if (!hasChanged) {
    return
  }

  const freshData = loadData()

  replaceObject(data.questions, freshData.questions)
  replaceObject(data.tobaccoTypes, freshData.tobaccoTypes)
  replaceObject(data.smokingChangeTypes, freshData.smokingChangeTypes)
  replaceObject(data.shishaSmokingSettings, freshData.shishaSmokingSettings)

  loadedAt = mtimes
}

refreshData(true)

/**
 * Get a normalised question by id.
 *
 * @param {string} id - Question id.
 * @returns {Question} Normalised question.
 * @throws {Error} When the question id is not defined in questions.yaml.
 */
const getQuestion = (id) => {
  refreshData()

  const question = data.questions[id]

  if (!question) {
    throw new Error(`Question not found: ${id}`)
  }

  return question
}

/**
 * Build a value-to-label lookup from a question's options.
 *
 * @param {string} id - Question id.
 * @returns {Object.<string, string>} Map of submitted values to display labels.
 */
const getQuestionValueLabels = (id) => {
  refreshData()

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
  refreshData,
  smokingChangeTypes: data.smokingChangeTypes,
  shishaSmokingSettings: data.shishaSmokingSettings,
  tobaccoTypes: data.tobaccoTypes
}
