const { calculators, RiskCalculatorInputError } = require('./risk-calculators')

const prototypeCaveat = 'Prototype only. Not clinically signed off. Do not use to make clinical decisions.'

const thresholds = {
  plcom2012: 0.0151,
  llpv2: 0.025
}

const hasValue = (value) => value !== undefined && value !== null && value !== ''

const getMissingInputs = (input = {}, requiredInputs = []) => {
  return requiredInputs.filter((field) => !hasValue(input[field]))
}

const formatCalculatorResult = (calculator, adapterResult) => {
  const input = adapterResult?.input || {}
  const missingInputs = getMissingInputs(input, calculator.requiredInputs)
  const threshold = thresholds[calculator.id]

  if (!adapterResult?.complete || missingInputs.length) {
    return {
      risk: null,
      probability: null,
      percent: null,
      roundedPercent: null,
      threshold,
      thresholdPercent: threshold * 100,
      eligible: false,
      calculated: false,
      inputsUsed: input,
      missingInputs,
      issues: adapterResult?.issues || []
    }
  }

  try {
    const result = calculator.calculate(input)

    return {
      risk: result.risk,
      probability: result.probability,
      percent: result.percent,
      roundedPercent: result.roundedPercent,
      threshold,
      thresholdPercent: threshold * 100,
      eligible: result.risk >= threshold,
      calculated: true,
      inputsUsed: result.inputs,
      missingInputs,
      issues: adapterResult.issues || []
    }
  } catch (error) {
    if (error instanceof RiskCalculatorInputError) {
      return {
        risk: null,
        probability: null,
        percent: null,
        roundedPercent: null,
        threshold,
        thresholdPercent: threshold * 100,
        eligible: false,
        calculated: false,
        inputsUsed: input,
        missingInputs,
        issues: [
          ...(adapterResult.issues || []),
          ...error.errors.map((issue) => ({
            field: issue.field,
            type: 'invalid',
            message: issue.message
          }))
        ]
      }
    }

    throw error
  }
}

const getRiskSummary = (answers = {}, adapter, options = {}) => {
  const calculatorInputs = adapter.toCalculatorInputs(answers, options)
  const summary = {
    plcom2012: formatCalculatorResult(calculators.plcom2012, calculatorInputs.plcom2012),
    llpv2: formatCalculatorResult(calculators.llpv2, calculatorInputs.llpv2)
  }
  const eligibleCalculatorIds = ['plcom2012', 'llpv2'].filter((id) => summary[id].eligible)
  const calculatedCalculatorIds = ['plcom2012', 'llpv2'].filter((id) => summary[id].calculated)

  return {
    ...summary,
    overall: {
      eligible: eligibleCalculatorIds.length > 0,
      reason: eligibleCalculatorIds[0] || (calculatedCalculatorIds.length === 2 ? 'below_threshold' : 'missing_inputs'),
      eligibleCalculators: eligibleCalculatorIds
    },
    caveat: prototypeCaveat
  }
}

const attachRiskSummary = (adapter) => {
  return (req, res, next) => {
    const answers = req.session?.data?.answers || {}

    res.locals.riskSummary = getRiskSummary(answers, adapter)

    next()
  }
}

module.exports = {
  attachRiskSummary,
  getRiskSummary,
  thresholds
}
