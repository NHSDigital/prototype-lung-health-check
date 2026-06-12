/**
 * Error for calculators that have a stable module shape but no implemented
 * calculation specification yet.
 */
class RiskCalculatorSpecificationError extends Error {
  /**
   * @param {string} calculatorId Calculator ID.
   * @param {string} message Error message.
   */
  constructor (calculatorId, message) {
    super(message)
    this.name = 'RiskCalculatorSpecificationError'
    this.code = 'RISK_CALCULATOR_SPECIFICATION_REQUIRED'
    this.calculatorId = calculatorId
  }
}

/**
 * Create a standard "specification required" error for an unimplemented
 * calculator.
 *
 * @param {string} calculatorId Calculator ID.
 * @param {string} calculatorName Calculator display name.
 * @returns {RiskCalculatorSpecificationError} Specification error.
 */
const createSpecificationRequiredError = (calculatorId, calculatorName) => {
  return new RiskCalculatorSpecificationError(
    calculatorId,
    `${calculatorName} cannot calculate a prototype risk score until the calculation rules have been added. Any prototype implementation must be labelled as not clinically signed off.`
  )
}

module.exports = {
  RiskCalculatorSpecificationError,
  createSpecificationRequiredError
}
