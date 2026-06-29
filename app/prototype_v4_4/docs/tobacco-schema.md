# Tobacco schema

Tobacco-specific content lives in `app/prototype_v4_4/data/tobacco.yaml`.

Use this file for content that is shared across the repeated tobacco sub-flow, including tobacco type names, quantity units and current or past tense headings.

## Top-level keys

| Key | Purpose |
| --- | --- |
| `tobaccoTypes` | Content for each tobacco type. |
| `smokingChangeTypes` | The ordered set of changed-smoking branches. |

## Tobacco types

Each tobacco type key must match the value used by the `smoking-type` question in `questions.yaml`.

```yaml
tobaccoTypes:
  cigarettes:
    caption: Cigarette smoking
    quantityUnit: cigarettes
    singularSuffix: cigarette
    suffix: cigarettes
    headings:
      current:
        status: Do you currently smoke cigarettes?
        years: Have you smoked cigarettes for more than 1 year?
        yearsInput: Enter the number of years you have smoked cigarettes
        frequency: How often do you smoke cigarettes?
        quantity: How many cigarettes do you currently smoke in a normal day?
        change: Has the number of cigarettes you normally smoke changed over time?
      past:
        years: Did you smoke cigarettes for more than 1 year?
        yearsInput: Enter the number of years you smoked cigarettes
        frequency: How often did you smoke cigarettes?
        quantity: How many cigarettes did you smoke in a normal day?
        change: Did the number of cigarettes you normally smoked change over time?
```

The tobacco flow uses `headings.current` when someone currently smokes and `headings.past` when someone used to smoke.

`years` and `yearsInput` are used by the `years-smoked` page, which is shown when more than one tobacco type has been selected.

`caption` is shown above the tobacco question heading.

`quantityUnit`, `singularSuffix` and `suffix` are used when answers are formatted in check your answers and when contextual change questions are built.

## Smoking change types

`smokingChangeTypes` controls the changed-smoking branches and their order.

```yaml
smokingChangeTypes:
  greater:
    answerKey: smokingChangeIncrease
    label: more
  fewer:
    answerKey: smokingChangeDecrease
    label: fewer
```

`answerKey` is the nested key used to store answers for that branch.
