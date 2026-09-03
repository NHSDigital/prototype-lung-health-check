# Project documentation

This folder contains shared documentation and reference material for the
Check if you need a lung scan prototype.

For documentation that belongs to a specific prototype version, see the
versioned folders under `app/prototype_v*/docs`.

## Contents

| File | Summary |
| --- | --- |
| [contributing-to-the-prototype.md](contributing-to-the-prototype.md) | Plain English guide to contributing using GitHub Desktop and GitHub. Covers cloning, branching, making changes, pull requests and reviews. |
| [risk-calculators.md](risk-calculators.md) | Notes on the shared prototype-only `LLPv2` and `PLCOm2012` risk calculator modules in `app/lib/risk-calculators`. Includes inputs, result format, caveats and next work. |
| [prototype-v4-calculator-adapters.md](prototype-v4-calculator-adapters.md) | How v4 prototype answers are adapted into shared risk calculator inputs. |
| [cigarette-equivalents.md](cigarette-equivalents.md) | Modelling reference for converting tobacco products into cigarette-equivalent amounts. Summarises the CSV conversion data. |
| [smoking-overlap-risk-calculator-impact.md](smoking-overlap-risk-calculator-impact.md) | Modelling note on how concurrent and consecutive tobacco smoking can affect `LLP`, `LLPv2` and `PLCOm2012` inputs. |
| [cigarette-equivalents--quantity.csv](cigarette-equivalents--quantity.csv) | Quantity-based cigarette-equivalent lookup data for products such as cigarettes, rolling tobacco, cigars, pipes, cigarillos and heated tobacco. |
| [cigarette-equivalents--time.csv](cigarette-equivalents--time.csv) | Time-based cigarette-equivalent lookup data for products such as shisha, chewing tobacco and dry snuff. |
| `master-llpv2-plcom2102-combined-tool.xlsx` | Local workbook source used by the prototype-only risk calculator implementation. |

## Important caveats

The calculator and tobacco-conversion notes are modelling references for
prototype work. They are not clinical guidance.

Risk calculator results in this repository are not clinically signed off and
must not be used to make clinical decisions.
