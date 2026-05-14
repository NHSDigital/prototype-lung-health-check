const { version } = require('./question-renderer')

/**
 * Resolve the back link for weight pages based on the height unit answered.
 *
 * @param {Object} req - Express request object.
 * @returns {string} Back link URL.
 */
const getHeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.height?.imperial ? `/prototype_${version}/height-imperial` : `/prototype_${version}/height-metric`
}

/**
 * Resolve the back link after weight pages based on the weight unit answered.
 *
 * @param {Object} req - Express request object.
 * @returns {string} Back link URL.
 */
const getWeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.weight?.imperial ? `/prototype_${version}/weight-imperial` : `/prototype_${version}/weight-metric`
}

/**
 * Resolve the next weight page after height, preserving an existing unit choice.
 *
 * @param {Object} req - Express request object.
 * @param {string} defaultUnit - Unit to use when no weight unit has been chosen.
 * @returns {string} Next weight page URL.
 */
const getWeightNext = (req, defaultUnit) => {
  const { answers } = req.session.data

  if (answers?.weight?.imperial) {
    return `/prototype_${version}/weight-imperial`
  }

  if (answers?.weight?.metric) {
    return `/prototype_${version}/weight-metric`
  }

  return `/prototype_${version}/weight-${defaultUnit}`
}

module.exports = {
  getHeightBack,
  getWeightBack,
  getWeightNext
}
