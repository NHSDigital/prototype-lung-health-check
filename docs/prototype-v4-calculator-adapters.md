# Prototype v4 calculator adapters

The shared v4 adapter code is in:

- `app/lib/measurements.js`
- `app/lib/tobacco-calculator-adapter.js`
- `app/lib/prototype-v4-calculator-adapter.js`

Each data-driven v4 prototype has a thin local export at
`app/prototype_v4_x/lib/calculator-adapter.js`, so prototype code can require
`../lib/calculator-adapter`.

The adapter converts `req.session.data.answers` into inputs for:

- `LLPv2`
- `PLCOm2012`

It does not apply risk thresholds or route to result pages.

## API

```js
const {
  toCalculatorInputs,
  toLlpv2Input,
  toPlcom2012Input
} = require('../lib/calculator-adapter')

const calculatorInputs = toCalculatorInputs(req.session.data.answers)
```

Each adapter result has:

```js
{
  calculatorId: 'plcom2012',
  input: {},
  complete: true,
  issues: [],
  derived: {}
}
```

`complete` means all fields required by that calculator are present. `issues`
lists missing, invalid, unmapped or estimated values. Some estimated values can
still be complete because the prototype answer was valid but needed a modelling
assumption, such as a representative value for a band.

## Shared derived values

| Calculator input | Prototype answer source |
| --- | --- |
| `age` | `dateOfBirth` |
| `bodyMassIndex` | `height` and `weight` |
| `smokingStatus` | `smoker`, per-type `smokingStatus`, or `smokingStatusCurrent` |
| `smokingDuration` | Per-type duration answers when present, otherwise global age-started and age-stopped answers |
| `smokingIntensity` | Tobacco quantities converted to average daily cigarette-equivalents |
| `quitYears` | Current smokers use `0`; former smokers use current age minus latest stopped-smoking age |

BMI uses metric values directly, or converts feet/inches and stone/pounds where
imperial answers were used.

## Category mappings

| Prototype answer | PLCOm2012 value |
| --- | --- |
| `asian_or_asian_british` | `asian` |
| `black_african_caribbean_or_black_british` | `black` |
| `mixed_or_multiple_ethnic_groups` | `mixed` |
| `white` | `white` |
| `other_ethnic_group` | `other` |
| `prefer_not_to_say` | `not_stated` |

The PLCOm2012 calculator currently treats `mixed`, `other` and `not_stated` as
the white reference group.

| Prototype answer | PLCOm2012 education value |
| --- | ---: |
| `before_15` | 1 |
| `gcse` | 2 |
| `a_level` | 3 |
| `further_education` | 4 |
| `undergraduate_degree` | 5 |
| `postgraduate_degree` | 6 |

`prefer_not_to_say` does not map to a PLCOm2012 education category and is
reported as an adapter issue.

Respiratory condition answers map as follows:

| Prototype answer | Calculator field |
| --- | --- |
| `bronchitis` | `bronchitis` |
| `chronic_obstructive_pulmonary_disease` | `copd` |
| `emphysema` | `emphysema` |
| `pneumonia` | `previousPneumonia` |
| `tuberculosis` | `tuberculosis` |

Asbestos exposure is true when either `asbestosAtWork` or `asbestosAtHome` is
`yes`.

Family history maps to PLCOm2012 as a boolean. For LLPv2 it maps to:

- `none` when relatives answer is `no` or `do_not_know`
- `early_onset` when relatives answer is `yes` and relative age answer is `yes`
- `late_onset` when relatives answer is `yes` and relative age answer is `no` or `do_not_know`

## Tobacco assumptions

Quantity-based products use the cigarette-equivalent factors documented in
`docs/cigarette-equivalents.md`.

Rolling tobacco gram bands use representative gram amounts:

| Prototype answer | Representative grams |
| --- | ---: |
| `less_than_10` | 5 |
| `10_to_30` | 20 |
| `31_to_50` | 40.5 |
| `51_to_75` | 63 |
| `76_to_100` | 88 |
| `more_than_100` | 100 |

Shisha time bands use representative minute amounts:

| Prototype answer | Representative minutes |
| --- | ---: |
| `up_to_30_minutes` | 15 |
| `30_minutes_to_1_hour` | 45 |
| `1_to_2_hours` | 90 |
| `more_than_2_hours` | 120 |

When multiple tobacco products are selected, exact overlap can only be derived
when per-product start and stop ages are available. If overlap is not available,
the adapter uses the available duration answers and records an estimated issue.
