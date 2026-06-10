const llpv2 = require('./llpv2')
const plcom2012 = require('./plcom2012')
const { RiskCalculatorInputError } = require('./input-error')
const { RiskCalculatorSpecificationError } = require('./specification-error')

const calculators = {
  [llpv2.id]: llpv2,
  [plcom2012.id]: plcom2012
}

/**
 * Get a shared calculator module by ID.
 *
 * @param {string} id Calculator ID, for example `llpv2` or `plcom2012`.
 * @returns {Object|undefined} Calculator module, or `undefined` if unknown.
 */
const getCalculator = (id) => calculators[id]

/**
 * List all shared calculator modules.
 *
 * @returns {Object[]} Calculator modules.
 */
const listCalculators = () => Object.values(calculators)

module.exports = {
  calculators,
  getCalculator,
  listCalculators,
  RiskCalculatorInputError,
  RiskCalculatorSpecificationError
}
