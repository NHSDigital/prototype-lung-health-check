# Error messages

This document summarises validation logic and error messages for `prototype_v4_1`.

Sources:

- `data/questions.yaml` for base question content, validation rules and error text
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
- `cancer-diagnosis-relatives`: `yes` continues to `cancer-diagnosis-relatives-age`; `no` clears that answer and continues to smoking history.
- `age-stopped-smoking`: only shown when `smoker` is `yes_previous`; otherwise the answer is cleared and the flow continues to `periods-stopped-smoking`.
- `periods-stopped-smoking`: if `no`, `yearsStoppedSmoking` is cleared.
- `smoking-type`: `none` goes to `smoking-type-exit`; otherwise the selected tobacco types create the tobacco sub-flow in tobacco.yaml order. Former smokers skip each type-specific `smoking-status` question.
- Non-shisha tobacco types ask `smoking-frequency`, `smoking-quantity`, then `smoking-change`. Shisha asks `smoking-setting`, then asks `smoking-frequency` and `smoking-quantity` for each selected setting.
- `smoking-change`: selected `greater` and `fewer` options create corresponding changed-smoking follow-up steps. Unselected changed-smoking answer groups are cleared.
- `smoking-quantity` and `smoking-quantity-change`: if `another_amount` is not selected, the related `smokingQuantityOther` answer is cleared.

## Runtime tobacco messages

- Tobacco sub-flow pages use `getSmokingContentQuestionOverrides()` before validation. The validator sees the runtime heading, input name, selected value and tobacco-specific variant.
- `smoking-status`, `smoking-frequency`, `smoking-setting`, `smoking-quantity`, `smoking-change`, `smoking-frequency-change`, `smoking-quantity-change`, and `smoking-years-change` can replace their base `required` text with contextual text generated from the runtime heading.
- For headings beginning `How often`, the required message is `Select ...`; for `How much`, `How many`, or `How long`, the message is `Enter ...` for text inputs and `Select ...` for single-choice inputs; yes/no headings become `Select whether ...`.
- For numeric tobacco quantity text inputs, non-rolling-tobacco and non-shisha types require whole numbers. The integer message is generated as `[answer phrase] must be a whole number`.
- For shisha `another_amount`, the conditional input messages are `Enter the number of hours`, `Number of hours must be a number`, `Number of hours must be 0.5 or more`, and `Number of hours must be [maxHours] or fewer`. `maxHours` is 24 for daily/non-shisha, 168 weekly, 744 monthly, and 8760 yearly.
- `smoking-quantity-change` adds a comparison error when a `greater` answer is not greater than the original amount, or a `fewer` answer is not fewer than the original amount after normalising by frequency. The message is generated as `[quantity phrase] must be more/fewer/less than [original quantity] [original frequency]`.

## Question messages

### accept-terms

Question: Terms of use

Type: `multiple`

Answer key: `acceptTerms`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Confirm that you have read and agree to the terms of use | `#accept-terms` |

### phone-questionnaire

Question: Confirm if you have completed a lung cancer risk questionnaire by phone

Type: `single`

Answer key: `phoneQuestionnaire`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have previously completed a lung cancer risk questionnaire by phone | `#phone-questionnaire` |

### smoker

Question: Tobacco smoking

Type: `single`

Answer key: `smoker`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever smoked tobacco | `#smoker` |

### date-of-birth

Question: What is your date of birth?

Type: `date`

Answer key: `dateOfBirth`

Validation: required; type: date

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your date of birth | `#dateOfBirth-day` |
| `invalid` | Enter a real date of birth | `#dateOfBirth-day` |

### face-to-face-appointment

Question: Check if you need a face-to-face appointment

Type: `single`

Answer key: `faceToFaceAppointment`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you need to leave the online service and ask for a face-to-face appointment | `#face-to-face-appointment` |

### height-metric

Question: Your height

Type: `text`

Answer key: `height`

Validation: required; type: number; minimum 139.7; maximum 243.8

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your height in centimetres | `#height-metric` |
| `invalid` | Enter your height in centimetres using numbers | `#height-metric` |
| `min` | Height in centimetres must be 139.7cm or more | `#height-metric` |
| `max` | Height in centimetres must be 243.8cm or fewer | `#height-metric` |

### height-imperial

Question: Your height

Type: `text_group`

Answer key: `height`

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

Question: Your weight

Type: `text`

Answer key: `weight`

Validation: required; type: number; maximum 2 decimal places; minimum 25.4; maximum 317.5

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter your weight in kilograms | `#weight-metric` |
| `invalid` | Enter your weight in kilograms using numbers | `#weight-metric` |
| `decimalPlaces` | Weight in kilograms must have 2 decimal places or fewer | `#weight-metric` |
| `min` | Weight in kilograms must be 25.4kg or more | `#weight-metric` |
| `max` | Weight in kilograms must be 317.5kg or fewer | `#weight-metric` |

### weight-imperial

Question: Your weight

Type: `text_group`

Answer key: `weight`

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

Question: Your gender identity

Type: `single`

Answer key: `gender`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select which option best describes you | `#gender` |

### sex

Question: Your sex at birth

Type: `single`

Answer key: `sex`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select your sex at birth | `#sex` |

### ethnicity

Question: Your ethnic background

Type: `single`

Answer key: `ethnicity`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select your ethnic background | `#ethnicity` |

### education

Question: Your education

Type: `single`

Answer key: `education`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select the highest level of education you have completed | `#education` |

### respiratory-conditions

Question: Have you ever been diagnosed with any of the following respiratory conditions?

Type: `multiple`

Answer key: `respiratoryConditions`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select if you have ever been diagnosed with any respiratory conditions | `#respiratory-conditions` |

### asbestos-at-work

Question: Tell us if you might have been exposed to asbestos at work

Type: `single`

Answer key: `asbestosAtWork`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever worked in a job where you might have been exposed to asbestos | `#asbestos-at-work` |

### asbestos-at-home

Question: Tell us if you ever lived with anyone who worked with asbestos

Type: `single`

Answer key: `asbestosAtHome`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever lived with anyone who worked with asbestos | `#asbestos-at-home` |

### cancer-diagnosis

Question: Tell us if you have ever been diagnosed with cancer

Type: `single`

Answer key: `cancerDiagnosis`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever been diagnosed with cancer | `#cancer-diagnosis` |

### cancer-diagnosis-relatives

Question: Tell us if your parents, siblings or children have ever been diagnosed with lung cancer

Type: `single`

Answer key: `cancerDiagnosisRelatives`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether any of your parents, siblings or children have ever been diagnosed with lung cancer | `#cancer-diagnosis-relatives` |

### cancer-diagnosis-relatives-age

Question: If your relatives were under 60 when they were diagnosed

Type: `single`

Answer key: `cancerDiagnosisRelativesAge`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether any of your relatives were younger than 60 when they were diagnosed with lung cancer | `#cancer-diagnosis-relatives-age` |

### age-started-smoking

Question: How old were you when you started smoking?

Type: `text`

Answer key: `ageStartedSmoking`

Validation: required; type: number; minimum 1; maximum 120

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter the age you started smoking | `#age-started-smoking` |
| `invalid` | Enter the age you started smoking using numbers | `#age-started-smoking` |
| `min` | Age you started smoking must be 1 or older | `#age-started-smoking` |
| `max` | Age you started smoking must be 120 or younger | `#age-started-smoking` |

### age-stopped-smoking

Question: How old were you when you stopped smoking?

Type: `text`

Answer key: `ageStoppedSmoking`

Validation: required; type: number; minimum 1; maximum 120

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter the age you stopped smoking | `#age-stopped-smoking` |
| `invalid` | Enter the age you stopped smoking using numbers | `#age-stopped-smoking` |
| `min` | Age you stopped smoking must be 1 or older | `#age-stopped-smoking` |
| `max` | Age you stopped smoking must be 120 or younger | `#age-stopped-smoking` |

### periods-stopped-smoking

Question: Periods when you stopped smoking

Type: `single`

Answer key: `periodsStoppedSmoking`

Validation: required; conditional: yes (required, number, min 1, max 80)

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you have ever stopped smoking for periods of 1 year or longer | `#periods-stopped-smoking` |
| `invalid` | Total number of years you stopped smoking must be a number | `#years-stopped-smoking` |
| `min` | Total number of years you stopped smoking must be 1 or more | `#years-stopped-smoking` |
| `max` | Total number of years you stopped smoking must be 80 or fewer | `#years-stopped-smoking` |
| `conditional.yes.required` | Enter the total number of years you stopped smoking | `#years-stopped-smoking` |

### smoking-type

Question: The type of tobacco you smoke or used to smoke

Type: `multiple`

Answer key: `smokingType`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select the types of tobacco you have smoked | `#smoking-type` |

Variants: `previous`. Variants can change type, options, hints or validation before the same validator runs.

### smoking-status

Question: Do you currently smoke?

Type: `single`

Answer key: `smokingStatus`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you currently smoke this type of tobacco | `#smoking-status` |

### smoking-frequency

Question: How often do you smoke?

Type: `single`

Answer key: `smokingFrequency`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select how often you smoke this type of tobacco | `#smoking-frequency` |

### smoking-quantity

Question: How much do you smoke?

Type: `text`

Answer key: `smokingQuantity`

Validation: required; type: number; minimum 1; maximum 200

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter how much you smoke | `#smoking-quantity` |
| `invalid` | Enter how much you smoke using numbers | `#smoking-quantity` |
| `min` | Amount smoked must be 1 or more | `#smoking-quantity` |
| `max` | Amount smoked must be 200 or fewer | `#smoking-quantity` |

Variants: `rolling_tobacco`, `shisha`. Variants can change type, options, hints or validation before the same validator runs.

### smoking-setting

Question: Do you usually smoke shisha in a group or on your own?

Type: `multiple`

Answer key: `smokingSetting`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether you usually smoke shisha in a group or on your own | `#smoking-setting` |

### smoking-change

Question: Has the amount you normally smoke changed over time?

Type: `multiple`

Answer key: `smokingChange`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select whether the amount you normally smoke has changed over time | `#smoking-change` |

### smoking-frequency-change

Question: How often did you smoke?

Type: `single`

Answer key: `smokingFrequencyChange`

Validation: required

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Select how often you smoked this type of tobacco | `#smoking-frequency-change` |

### smoking-quantity-change

Question: How much did you smoke?

Type: `text`

Answer key: `smokingQuantityChange`

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

Validation: required; type: number; minimum 1; maximum 80

| Rule | Message | Link |
| --- | --- | --- |
| `required` | Enter how many years you smoked this amount | `#smoking-years-change` |
| `invalid` | Enter how many years using numbers | `#smoking-years-change` |
| `min` | Number of years must be 1 or more | `#smoking-years-change` |
| `max` | Number of years must be 80 or fewer | `#smoking-years-change` |
