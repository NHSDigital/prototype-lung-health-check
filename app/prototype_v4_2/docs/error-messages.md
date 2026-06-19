# Error messages

This document summarises validation logic and error messages for `prototype_v4_2`.

Sources:

- `data/questions.yaml` for base question content, validation rules and error text
- `data/pages.yaml` for grouped-page composition and conditional question display
- `lib/question-validator.js` for shared validation behaviour
- `lib/tobacco-flow.js` for runtime tobacco question overrides
- `controllers/question.js` for route branching and answer-clearing logic

## Shared validation logic

- Blank values are `undefined`, `null`, an empty string after trimming, or an empty array.
- `required` errors stop further validation for that question or field.
- Date validation only accepts real calendar dates. If no date part is supplied, the `required` message is used; if any date part is supplied but the date is not real, the `invalid` message is used.
- Number validation rejects non-finite numbers, then checks whole-number, decimal-place, minimum and maximum rules in that order.
- Grouped text inputs validate each item first. Total minimum and maximum checks only run when the grouped values are present and numerically valid.
- Conditional reveal validation only runs for the selected trigger value. If the conditional value is blank, the conditional `required` message is used; number rules then use the question-level number error messages unless a runtime override replaces them.
- Error links default to `#${question.input.id || question.id}`. Date, grouped and conditional inputs usually set explicit `href` values.

## Flow logic

- `phone-questionnaire`: `yes` goes to `phone-questionnaire-exit`; `no` continues to `smoker`.
- `smoker`: `no` or `yes_fewer_than_100` goes to `not-eligible-for-screening`; current or previous smokers continue to `date-of-birth`.
- `date-of-birth`: valid dates outside the eligible scan age range go to `not-eligible-for-scan`; eligible users continue to `face-to-face-appointment`.
- `face-to-face-appointment`: `yes` goes to `book-appointment`; `no` continues to height and weight.
- `height-*` and `weight-*`: metric and imperial pages are alternatives. Submitting one unit clears the other unit answer.
- `asbestos`: grouped page that validates `asbestos-at-work` and `asbestos-at-home` together.
- `cancer-diagnosis-relatives`: `yes` continues to `cancer-diagnosis-relatives-age`; `no` clears that answer and goes to `check-your-answers`.
- `smoking-duration`: grouped page. `age-stopped-smoking` is visible only when `smoker` is `yes_previous` or type-specific `smoking-status` is `no`; otherwise `ageStoppedSmoking` is cleared. If `periods-stopped-smoking` is `no`, `yearsStoppedSmoking` is cleared.
- `smoking-type`: `none` goes to `smoking-type-exit`; otherwise selected tobacco types create the tobacco sub-flow in tobacco.yaml order. Former smokers skip each type-specific `smoking-status` question.
- `tobacco-smoking`: grouped tobacco page that validates `smoking-frequency` and `smoking-quantity` together for the active tobacco type.
- `smoking-change`: selected `greater` and `fewer` options create corresponding changed-smoking follow-up steps. Unselected changed-smoking answer groups are cleared.
- `tobacco-smoking-change`: grouped tobacco page that validates `smoking-frequency-change`, `smoking-quantity-change`, and `smoking-years-change` together for the active tobacco type and change direction.
- `smoking-quantity` and `smoking-quantity-change`: if `another_amount` is not selected, the related `smokingQuantityOther` answer is cleared.

## Page composition

- `accept-terms`: `accept-terms`
- `phone-questionnaire`: `phone-questionnaire`
- `smoker`: `smoker`
- `date-of-birth`: `date-of-birth`
- `face-to-face-appointment`: `face-to-face-appointment`
- `height-metric`: `height-metric`
- `height-imperial`: `height-imperial`
- `weight-metric`: `weight-metric`
- `weight-imperial`: `weight-imperial`
- `gender`: `gender`
- `sex`: `sex`
- `ethnicity`: `ethnicity`
- `education`: `education`
- `respiratory-conditions`: `respiratory-conditions`
- `asbestos`: `asbestos-at-work`, `asbestos-at-home`
- `cancer-diagnosis`: `cancer-diagnosis`
- `cancer-diagnosis-relatives`: `cancer-diagnosis-relatives`
- `cancer-diagnosis-relatives-age`: `cancer-diagnosis-relatives-age`
- `smoking-duration`: `age-started-smoking`, `age-stopped-smoking` (shown when any configured condition matches), `periods-stopped-smoking`
- `smoking-type`: `smoking-type`
- `smoking-status`: `smoking-status`
- `tobacco-smoking`: `smoking-frequency`, `smoking-quantity`
- `tobacco-smoking-change`: `smoking-frequency-change`, `smoking-quantity-change`, `smoking-years-change`
- `smoking-change`: `smoking-change`

## Runtime tobacco messages

- Tobacco sub-flow pages use `getSmokingContentQuestionOverrides()` before validation. The validator sees the runtime heading, input name, selected value and tobacco-specific variant.
- `smoking-status`, `smoking-frequency`, `smoking-quantity`, `smoking-change`, `smoking-frequency-change`, `smoking-quantity-change`, and `smoking-years-change` can replace their base `required` text with contextual text generated from the runtime heading.
- For headings beginning `How often`, the required message is `Select ...`; for `How much`, `How many`, or `How long`, the message is `Enter ...` for text inputs and `Select ...` for single-choice inputs; yes/no headings become `Select whether ...`.
- For numeric tobacco quantity text inputs, non-rolling-tobacco and non-shisha types require whole numbers. The integer message is generated as `[answer phrase] must be a whole number`.
- For shisha `another_amount`, the conditional input messages are `Enter the number of hours`, `Number of hours must be a number`, `Number of hours must be 0.5 or more`, and `Number of hours must be [maxHours] or fewer`. `maxHours` is 24 for daily/non-shisha, 168 weekly, 744 monthly, and 8760 yearly.
- `smoking-quantity-change` adds a comparison error when a `greater` answer is not greater than the original amount, or a `fewer` answer is not fewer than the original amount after normalising by frequency. The message is generated as `[quantity phrase] must be more/fewer/less than [original quantity] [original frequency]`.

## Question messages

### accept-terms

Question: Confirm you agree to the terms of use

Type: `multiple`

Answer key: `acceptTerms`

Page: `accept-terms`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Confirm that you have read and agree to the terms of use | `#accept-terms` |

### phone-questionnaire

Question: Have you previously completed a lung cancer risk questionnaire by phone in the last 12 months?

Type: `single`

Answer key: `phoneQuestionnaire`

Page: `phone-questionnaire`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have previously completed a lung cancer risk questionnaire by phone | `#phone-questionnaire` |

### smoker

Question: Have you ever smoked tobacco?

Type: `single`

Answer key: `smoker`

Page: `smoker`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever smoked tobacco | `#smoker` |

### date-of-birth

Question: What is your date of birth?

Type: `date`

Answer key: `dateOfBirth`

Page: `date-of-birth`

Validation: required; type: date

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your date of birth | `#dateOfBirth-day` |
| `invalid` | Enter a real date of birth | `#dateOfBirth-day` |

### face-to-face-appointment

Question: Do you need to leave the online service and ask for a face-to-face appointment?

Type: `single`

Answer key: `faceToFaceAppointment`

Page: `face-to-face-appointment`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you need to leave the online service and ask for a face-to-face appointment | `#face-to-face-appointment` |

### height-metric

Question: What is your height in centimetres?

Type: `text`

Answer key: `height`

Page: `height-metric`

Validation: required; type: number; minimum 139.7; maximum 243.8

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your height in centimetres | `#height-metric` |
| `invalid` | Enter your height in centimetres using numbers | `#height-metric` |
| `min` | Height in centimetres must be 139.7cm or more | `#height-metric` |
| `max` | Height in centimetres must be 243.8cm or fewer | `#height-metric` |

### height-imperial

Question: What is your height in feet and inches?

Type: `text_group`

Answer key: `height`

Page: `height-imperial`

Validation: grouped input items: feet (required, number, whole number, min 0); inches (required, number, whole number, min 0, max 11); group total: min 55, max 96

| Rule | Message | Link |
| --- | --- | --- |
| `feet.required` | Enter your height in feet | `#height-imperial-feet` |
| `feet.invalid` | Enter your height in feet using numbers | `#height-imperial-feet` |
| `feet.integer` | Height in feet must be a whole number | `#height-imperial-feet` |
| `feet.min` | Height in feet must be 0ft or more | `#height-imperial-feet` |
| `inches.required` | Enter your height in inches | `#height-imperial-inches` |
| `inches.invalid` | Enter your height in inches using numbers | `#height-imperial-inches` |
| `inches.integer` | Height in inches must be a whole number | `#height-imperial-inches` |
| `inches.min` | Height in inches must be 0in or more | `#height-imperial-inches` |
| `inches.max` | Height in inches must be 11in or fewer | `#height-imperial-inches` |
| `total.min` | Height must be between 4 feet 7 inches and 8 feet | `#height-imperial-feet` |
| `total.max` | Height must be between 4 feet 7 inches and 8 feet | `#height-imperial-feet` |

### weight-metric

Question: What is your weight in kilograms?

Type: `text`

Answer key: `weight`

Page: `weight-metric`

Validation: required; type: number; maximum 2 decimal places; minimum 25.4; maximum 317.5

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your weight in kilograms | `#weight-metric` |
| `invalid` | Enter your weight in kilograms using numbers | `#weight-metric` |
| `decimalPlaces` | Weight in kilograms must have 2 decimal places or fewer | `#weight-metric` |
| `min` | Weight in kilograms must be 25.4kg or more | `#weight-metric` |
| `max` | Weight in kilograms must be 317.5kg or fewer | `#weight-metric` |

### weight-imperial

Question: What is your weight in stones and pounds?

Type: `text_group`

Answer key: `weight`

Page: `weight-imperial`

Validation: grouped input items: stones (required, number, whole number, min 0); pounds (required, number, whole number, min 0, max 13); group total: min 56, max 700

| Rule | Message | Link |
| --- | --- | --- |
| `stones.required` | Enter your weight in stones | `#weight-imperial-stones` |
| `stones.invalid` | Enter your weight in stones using numbers | `#weight-imperial-stones` |
| `stones.integer` | Weight in stones must be a whole number | `#weight-imperial-stones` |
| `stones.min` | Weight in stones must be 0st or more | `#weight-imperial-stones` |
| `pounds.required` | Enter your weight in pounds | `#weight-imperial-pounds` |
| `pounds.invalid` | Enter your weight in pounds using numbers | `#weight-imperial-pounds` |
| `pounds.integer` | Weight in pounds must be a whole number | `#weight-imperial-pounds` |
| `pounds.min` | Weight in pounds must be 0lb or more | `#weight-imperial-pounds` |
| `pounds.max` | Weight in pounds must be 13lb or fewer | `#weight-imperial-pounds` |
| `total.min` | Weight must be between 4 stone and 50 stone | `#weight-imperial-stones` |
| `total.max` | Weight must be between 4 stone and 50 stone | `#weight-imperial-stones` |

### gender

Question: Which of these best describes your gender identity?

Type: `single`

Answer key: `gender`

Page: `gender`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select which option best describes your gender identity | `#gender` |

### sex

Question: What was your sex at birth?

Type: `single`

Answer key: `sex`

Page: `sex`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select your sex at birth | `#sex` |

### ethnicity

Question: What is your ethnic background?

Type: `single`

Answer key: `ethnicity`

Page: `ethnicity`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select your ethnic background | `#ethnicity` |

### education

Question: What is the highest level of education you have completed?

Type: `single`

Answer key: `education`

Page: `education`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select the highest level of education you have completed | `#education` |

### respiratory-conditions

Question: Have you ever been diagnosed with any of the following respiratory conditions?

Type: `multiple`

Answer key: `respiratoryConditions`

Page: `respiratory-conditions`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select if you have ever been diagnosed with any respiratory conditions | `#respiratory-conditions` |

### asbestos-at-work

Question: Have you ever worked in a job where you might have been exposed to asbestos?

Type: `single`

Answer key: `asbestosAtWork`

Page: `asbestos`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever worked in a job where you might have been exposed to asbestos | `#asbestos-at-work` |

### asbestos-at-home

Question: Have you ever lived with anyone who worked with asbestos?

Type: `single`

Answer key: `asbestosAtHome`

Page: `asbestos`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever lived with anyone who worked with asbestos | `#asbestos-at-home` |

### cancer-diagnosis

Question: Have you ever been diagnosed with cancer?

Type: `single`

Answer key: `cancerDiagnosis`

Page: `cancer-diagnosis`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever been diagnosed with cancer | `#cancer-diagnosis` |

### cancer-diagnosis-relatives

Question: Have any of your parents, siblings or children ever been diagnosed with lung cancer?

Type: `single`

Answer key: `cancerDiagnosisRelatives`

Page: `cancer-diagnosis-relatives`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether any of your parents, siblings or children have ever been diagnosed with lung cancer | `#cancer-diagnosis-relatives` |

### cancer-diagnosis-relatives-age

Question: Were any of your relatives younger than 60 years old when they were diagnosed with lung cancer?

Type: `single`

Answer key: `cancerDiagnosisRelativesAge`

Page: `cancer-diagnosis-relatives-age`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether any of your relatives were younger than 60 when they were diagnosed with lung cancer | `#cancer-diagnosis-relatives-age` |

### age-started-smoking

Question: How old were you when you started smoking?

Type: `text`

Answer key: `ageStartedSmoking`

Page: `smoking-duration`

Validation: required; type: number; minimum 1; maximum 120

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter the age you started smoking | `#age-started-smoking` |
| `invalid` | Enter the age you started smoking using numbers | `#age-started-smoking` |
| `min` | Age you started smoking must be 1 or older | `#age-started-smoking` |
| `max` | Age you started smoking must be 120 or younger | `#age-started-smoking` |

### age-stopped-smoking

Question: How old were you when you quit smoking?

Type: `text`

Answer key: `ageStoppedSmoking`

Page: `smoking-duration`

Validation: required; type: number; minimum 1; maximum 120

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter the age you quit smoking | `#age-stopped-smoking` |
| `invalid` | Enter the age you quit smoking using numbers | `#age-stopped-smoking` |
| `min` | Age you quit smoking must be 1 or older | `#age-stopped-smoking` |
| `max` | Age you quit smoking must be 120 or younger | `#age-stopped-smoking` |

### periods-stopped-smoking

Question: Have you ever stopped smoking for periods of 1 year or longer?

Type: `single`

Answer key: `periodsStoppedSmoking`

Page: `smoking-duration`

Validation: required; conditional: yes (required, number, min 1, max 80)

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever stopped smoking for periods of 1 year or longer | `#periods-stopped-smoking` |
| `invalid` | Total number of years you stopped smoking must be a number | `#years-stopped-smoking` |
| `min` | Total number of years you stopped smoking must be 1 or more | `#years-stopped-smoking` |
| `max` | Total number of years you stopped smoking must be 80 or fewer | `#years-stopped-smoking` |
| `conditional.yes.required` | Enter the total number of years you stopped smoking | `#years-stopped-smoking` |

### smoking-type

Question: Have you ever smoked any of the following types of tobacco?

Type: `multiple`

Answer key: `smokingType`

Page: `smoking-type`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select the types of tobacco you have smoked | `#smoking-type` |

Variants: `previous`. Variants can change type, options, hints or validation before the same validator runs.

### smoking-status

Question: Do you currently smoke?

Type: `single`

Answer key: `smokingStatus`

Page: `smoking-status`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you currently smoke this type of tobacco | `#smoking-status` |

### smoking-frequency

Question: How often do you smoke?

Type: `single`

Answer key: `smokingFrequency`

Page: `tobacco-smoking`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select how often you smoke this type of tobacco | `#smoking-frequency` |

### smoking-quantity

Question: How much do you smoke?

Type: `text`

Answer key: `smokingQuantity`

Page: `tobacco-smoking`

Validation: required; type: number; minimum 1; maximum 200

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter how much you smoke | `#smoking-quantity` |
| `invalid` | Enter how much you smoke using numbers | `#smoking-quantity` |
| `min` | Amount smoked must be 1 or more | `#smoking-quantity` |
| `max` | Amount smoked must be 200 or fewer | `#smoking-quantity` |

Variants: `rolling_tobacco`, `shisha`. Variants can change type, options, hints or validation before the same validator runs.

### smoking-change

Question: Has the amount you normally smoke changed over time?

Type: `multiple`

Answer key: `smokingChange`

Page: `smoking-change`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether the amount you normally smoke has changed over time | `#smoking-change` |

### smoking-frequency-change

Question: How often did you smoke?

Type: `single`

Answer key: `smokingFrequencyChange`

Page: `tobacco-smoking-change`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select how often you smoked this type of tobacco | `#smoking-frequency-change` |

### smoking-quantity-change

Question: How much did you smoke?

Type: `text`

Answer key: `smokingQuantityChange`

Page: `tobacco-smoking-change`

Validation: required; type: number; minimum 1; maximum 200

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter how much you smoked | `#smoking-quantity-change` |
| `invalid` | Enter how much you smoked using numbers | `#smoking-quantity-change` |
| `min` | Amount smoked must be 1 or more | `#smoking-quantity-change` |
| `max` | Amount smoked must be 200 or fewer | `#smoking-quantity-change` |

Variants: `rolling_tobacco`. Variants can change type, options, hints or validation before the same validator runs.

### smoking-years-change

Question: How many years did you smoke this amount?

Type: `text`

Answer key: `smokingYearsChange`

Page: `tobacco-smoking-change`

Validation: required; type: number; minimum 1; maximum 80

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter how many years you smoked this amount | `#smoking-years-change` |
| `invalid` | Enter how many years using numbers | `#smoking-years-change` |
| `min` | Number of years must be 1 or more | `#smoking-years-change` |
| `max` | Number of years must be 80 or fewer | `#smoking-years-change` |

