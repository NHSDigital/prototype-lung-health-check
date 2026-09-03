# Lung cancer risk calculators

This page explains the shared `LLPv2` and `PLCOm2012` calculator code in the prototype.

The code is in `app/lib/risk-calculators`.

## What this work includes

This work includes:

- shared calculator modules
- working `calculate()` functions for `LLPv2` and `PLCOm2012`
- the input fields each calculator needs
- notes about how the calculators should be used in prototypes

This work does not include:

- mapping prototype answers to calculator input fields
- adding calculators to any prototype journey
- deciding if someone is high risk or low risk
- showing calculator results in a user interface
- adding test profiles for low, high or threshold risk
- clinical sign-off
- validation against examples approved by the programme team

## Important

This code is for prototype use only.

The calculator results are not clinically signed off. Do not use them to make clinical decisions.

If a prototype page, debug screen or research artefact shows a risk score, it must say that the score is not clinically signed off. This must be clear to:

- researchers
- designers
- doctors, nurses and other health professionals
- people reviewing the prototype

## Shared code

The shared module exports:

- `calculators`
- `getCalculator(id)`
- `listCalculators()`
- `RiskCalculatorInputError`
- `RiskCalculatorSpecificationError`

The calculator IDs are:

- `llpv2`
- `plcom2012`

Each calculator exports:

- `id`
- `name`
- `requiredInputs`
- `sourceReferences`
- `calculationSpec`
- `calculate(input)`

The calculator modules do not:

- read from a prototype session
- apply eligibility thresholds
- decide which result page a person should see

This keeps the formula code separate from each prototype journey.

## Result format

Both calculators return the same result format:

```js
{
  id: 'plcom2012',
  name: 'PLCOm2012',
  risk: 0.0047608486904511266,
  probability: 0.0047608486904511266,
  percent: 0.47608486904511266,
  roundedPercent: 0.48,
  timeHorizonYears: 6,
  inputs: {},
  details: {},
  caveat: 'Prototype only. Not clinically signed off. Do not use to make clinical decisions.'
}
```

`risk` and `probability` mean the same thing. They are a number from 0 to 1.

`percent` is the same value as a percentage.

`roundedPercent` is rounded to 2 decimal places. This matches the local combined-tool workbook.

## Eligibility thresholds

The `calculate()` functions do not apply eligibility thresholds.

For example, `calculate()` returns the PLCOm2012 risk score. It does not check whether the score is above a threshold such as 1.51%.

Each prototype or adapter should own:

- the threshold value
- the threshold comparison rule
- the rule for using one calculator or both calculators
- any result page routing

The shared prototype risk summary in `app/lib/risk-summary.js` applies these
prototype-only thresholds:

- `PLCOm2012`: `0.0151`, or `1.51%`
- `LLPv2`: `0.025`, or `2.5%`

It returns both calculator results and an `overall` decision:

```js
{
  plcom2012: { risk: 0.0231, percent: 2.31, eligible: true },
  llpv2: { risk: 0.018, percent: 1.8, eligible: false },
  overall: { eligible: true, reason: 'plcom2012' }
}
```

The real object also includes `inputsUsed`, `missingInputs`, threshold values
and adapter issues to help debug prototype journeys.

The data-driven v4 prototypes expose the summary in the browser console as
`window.prototypeRiskSummary`. Set `RISK_SUMMARY_DEBUG=true` to show the same
summary in the prototype UI. Any UI or research use must show the prototype-only
caveat above.

## PLCOm2012

`PLCOm2012` returns a 6-year risk of lung cancer.

It uses the published logistic model coefficients. It also uses the same smoking intensity transform as the local combined-tool workbook:

```text
((cigarettes per day / 10)^-1) - 0.4021541613
```

### Input fields

`PLCOm2012` needs:

- `age`
- `ethnicity`
- `education`
- `bodyMassIndex`
- `copd`
- `personalCancerHistory`
- `familyLungCancerHistory`
- `smokingStatus`
- `smokingIntensity`
- `smokingDuration`
- `quitYears`

Accepted `ethnicity` values are:

- `white`
- `black`
- `hispanic`
- `asian`
- `native_hawaiian_or_pacific_islander`
- `american_indian_or_alaska_native`

The code also accepts the NHS Digital ethnicity codes used by the local workbook for the white, black and Asian PLCO groups.

Accepted `education` values are:

- `1` for less than high school
- `2` for high school graduate
- `3` for post high school training
- `4` for some college
- `5` for college graduate
- `6` for postgraduate or professional degree

Accepted `smokingStatus` values are:

- `current`
- `former`

## LLPv2

`LLPv2` returns a 5-year risk of lung cancer.

It follows the local combined-tool workbook. It uses:

- age and sex baseline logits from the hidden `RiskFactors` sheet
- interpolation between 5-year age bands
- smoking duration bands
- asbestos exposure
- previous pneumonia
- family history of lung cancer
- the workbook factor for lung conditions or personal history of cancer

### Input fields

`LLPv2` needs:

- `age`
- `sex`
- `smokingDuration`
- `previousPneumonia`
- `asbestosExposure`
- `copd`
- `emphysema`
- `bronchitis`
- `tuberculosis`
- `personalCancerHistory`
- `familyLungCancerHistory`

Accepted `sex` values are:

- `male`
- `female`

Accepted `familyLungCancerHistory` values are:

- `none`
- `early_onset`
- `late_onset`

For compatibility with the earlier stub, the calculator also accepts `familyLungCancerHistory: true` with `relativeDiagnosedBefore60`.

Boolean LLPv2 inputs accept:

- `true` or `false`
- workbook-style codes where `1` means yes and `2` means no

## Errors

If the input is missing or invalid, the calculator throws `RiskCalculatorInputError`.

The error includes:

- `code`, set to `RISK_CALCULATOR_INPUT_INVALID`
- `calculatorId`
- `errors`, with validation messages for each field

## Sources

The implementation uses:

- `docs/master-llpv2-plcom2102-combined-tool.xlsx`
- [Tammemagi MC et al. Selection Criteria for Lung-Cancer Screening](https://pubmed.ncbi.nlm.nih.gov/23425165/)
- [PLCOm2012 coefficient table, PMCID PMC3929969](https://pmc.ncbi.nlm.nih.gov/articles/PMC3929969/)
- [Field JK et al. Liverpool Lung Project lung cancer risk stratification model](https://pubmed.ncbi.nlm.nih.gov/33082166/)
- [Raji OY et al. Predictive accuracy of the Liverpool Lung Project risk model](https://pubmed.ncbi.nlm.nih.gov/22910935/)

If the team agrees a different source, update the calculator code and this page together.

## Prototype adapters

The v4 session-answer adapter is documented in
`docs/prototype-v4-calculator-adapters.md`.

The adapter sits outside the calculator modules. This keeps the formula code
reusable across the v4 prototypes.

The adapter owns:

- how prototype answers map to calculator categories
- how age and BMI are derived
- cigarette-equivalent tobacco mapping
- how missing, unknown, refused or estimated answers are reported

Each prototype or result flow should still own:

- eligibility thresholds
- threshold comparison rules
- result page routing
- content that says the score is not clinically signed off
