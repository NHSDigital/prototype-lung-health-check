/**
 * Error thrown when a calculator receives missing or invalid input values.
 */
class RiskCalculatorInputError extends Error {
  /**
   * @param {string} calculatorId Calculator ID.
   * @param {import('./helpers').RiskCalculatorFieldError[]} errors Field-level validation errors.
   */
  constructor (calculatorId, errors) {
    super(`Cannot calculate risk score because ${errors.length} input value${errors.length === 1 ? ' is' : 's are'} missing or invalid.`)
    this.name = 'RiskCalculatorInputError'
    this.code = 'RISK_CALCULATOR_INPUT_INVALID'
    this.calculatorId = calculatorId
    this.errors = errors
  }
}

module.exports = {
  RiskCalculatorInputError
}
