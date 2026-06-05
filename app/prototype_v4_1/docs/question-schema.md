# Question schema

Question content for prototype v4.1 lives in `app/prototype_v4_1/data/questions.yaml`.

The file should only contain standard question content under the top-level `questions` key. Tobacco-specific content, such as tobacco type names and current or past tense headings, lives in `app/prototype_v4_1/data/tobacco.yaml`.

## Basic structure

Each item in `questions` represents one reusable question.

```yaml
questions:
  - id: education
    type: single
    answerKey: education
    heading:
      title: Your education
      caption: About you
    description: |
      We ask this question because education is linked to other factors that may impact your chances of developing lung cancer.
    input:
      label: What is the highest level of education you have completed?
    options:
      - label: GCSEs
        hint: Previously O-levels
        value: gcse
      - divider: or
      - label: I prefer not to say
        value: prefer_not_to_say
    summary:
      label: Education
    validation:
      required: true
    errors:
      required:
        text: Select the highest level of education you have completed
```

## Common fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable question ID used by the controller, renderer and default input ID. Use kebab case. |
| `type` | Yes | Question type rendered by `_question.html`. |
| `answerKey` | No | Key used in `req.session.data.answers`. If omitted, the question ID is converted to camel case. |
| `heading.title` | Yes | Page heading or fieldset legend. |
| `heading.caption` | No | Caption shown above the heading. |
| `description` | No | Markdown content shown between the heading and input label. |
| `details` | No | NHS details component content. |
| `input` | Usually | Input, radios or checkboxes configuration. |
| `options` | For choice questions | Options for radios or checkboxes. |
| `summary` | No | Check your answers label and hidden text. |
| `validation` | No | Validation rules for the question. |
| `errors` | When validating | Error messages for validation failures. |
| `variants` | No | Alternative content used by controller or flow overrides. |
| `switchUnits` | No | Link text for height and weight unit switching. |

## Heading and input labels

If `input.label` is not set, the renderer uses `heading.title` as the input label and sets `isPageHeading` to `true`.

Use this when the visible question text should be the page heading and the input label, for example:

```yaml
- id: age-started-smoking
  type: text
  heading:
    title: How old were you when you started smoking?
    caption: Your smoking habits
  input:
    hint: Give an estimate if you are not sure
```

Use `input.label` when the page needs separate introductory heading content and a specific fieldset or input label:

```yaml
- id: smoker
  type: single
  heading:
    title: Tobacco smoking
  input:
    label: Have you ever smoked tobacco?
    hint: This includes social smoking
```

## Descriptions and details

`description` supports Markdown and is rendered between the page heading and the input label.

Use `details` for expandable supporting content:

```yaml
details:
  summary: What is asbestos?
  text: |
    Asbestos was used in a number of building materials and products.
```

## Question types

### `single`

Renders NHS radios.

```yaml
- id: smoker
  type: single
  answerKey: smoker
  heading:
    title: Tobacco smoking
  input:
    label: Have you ever smoked tobacco?
    hint: This includes social smoking
  options:
    - label: Yes, I currently smoke
      value: yes_current
    - label: No, I have never smoked
      value: no
  validation:
    required: true
  errors:
    required:
      text: Select whether you have ever smoked tobacco
```

### `multiple`

Renders NHS checkboxes.

```yaml
- id: respiratory-conditions
  type: multiple
  answerKey: respiratoryConditions
  heading:
    title: Have you ever been diagnosed with any of the following respiratory conditions?
    caption: Your health
  input:
    hint: Select all that apply
  options:
    - label: Bronchitis
      value: bronchitis
      exclusiveGroup: conditions-list
    - divider: or
    - label: No, I have not had any of these respiratory conditions
      value: no
      exclusive: true
      exclusiveGroup: conditions-list
```

Use `exclusive: true` for a checkbox option that should clear the other options in the same group.

### `text`

Renders a single NHS input.

```yaml
- id: height-metric
  type: text
  answerKey: height
  heading:
    title: Your height
    caption: About you
  input:
    id: height-metric
    name: answers[height][metric]
    valueKey: metric
    label: What is your height in centimetres?
    suffix: cm
    inputmode: numeric
    classes: nhsuk-input--width-4
```

Use `valueKey` when the answer is stored under a nested key, such as `answers.height.metric`.

### `text_group`

Renders a group of related text inputs in one fieldset, for example feet and inches.

```yaml
- id: height-imperial
  type: text_group
  answerKey: height
  heading:
    title: Your height
    caption: About you
  input:
    label: What is your height in feet and inches?
    valueKey: imperial
    items:
      - id: height-imperial-feet
        name: answers[height][imperial][feet]
        label: Feet
        answerKey: feet
        suffix: ft
      - id: height-imperial-inches
        name: answers[height][imperial][inches]
        label: Inches
        answerKey: inches
        suffix: in
```

Each item needs a matching validation rule and error messages when validation is required.

### `date`

Renders an NHS date input.

```yaml
- id: date-of-birth
  type: date
  answerKey: dateOfBirth
  heading:
    title: What is your date of birth?
  input:
    hint: For example, 15 3 1964
    items:
      - id: dateOfBirth-day
        name: answers[dateOfBirth][day]
        label: Day
        answerKey: day
      - id: dateOfBirth-month
        name: answers[dateOfBirth][month]
        label: Month
        answerKey: month
      - id: dateOfBirth-year
        name: answers[dateOfBirth][year]
        label: Year
        answerKey: year
  validation:
    required: true
    type: date
  errors:
    required:
      text: Enter your date of birth
      href: "#dateOfBirth-day"
    invalid:
      text: Enter a real date of birth
      href: "#dateOfBirth-day"
```

Date errors should usually link to the day input.

## Options

Option fields map to NHS radios or checkboxes items.

| Field | Description |
| --- | --- |
| `label` | Visible option text. |
| `hint` | Optional hint under the option label. |
| `value` | Submitted value stored in the session. |
| `divider` | Divider text, for example `or`. |
| `exclusive` | Marks a checkbox option as exclusive. |
| `exclusiveGroup` | Shared group name for exclusive checkbox behaviour. |
| `conditionalInput` | Input shown when the option is selected. |

## Conditional reveal inputs

Use `conditionalInput` on an option to show an input when that option is selected.

The validation rule for the conditional input lives under `validation.conditional`.

```yaml
options:
  - label: Yes
    value: yes
    conditionalInput:
      id: years-stopped-smoking
      name: answers[yearsStoppedSmoking]
      answerKey: yearsStoppedSmoking
      label: Enter the total number of years you stopped smoking
      suffix: Years
      inputmode: numeric
      classes: nhsuk-input--width-4
  - label: No
    value: no
validation:
  required: true
  conditional:
    yes:
      required: true
      type: number
      min: 1
      max: 80
      answerKey: yearsStoppedSmoking
      href: "#years-stopped-smoking"
errors:
  required:
    text: Select whether you have ever stopped smoking for periods of 1 year or longer
  conditional:
    yes:
      required:
        text: Enter the total number of years you stopped smoking
        href: "#years-stopped-smoking"
  invalid:
    text: Total number of years you stopped smoking must be a number
    href: "#years-stopped-smoking"
  min:
    text: Total number of years you stopped smoking must be 1 or more
    href: "#years-stopped-smoking"
  max:
    text: Total number of years you stopped smoking must be 80 or fewer
    href: "#years-stopped-smoking"
```

## Validation

Supported validation fields are:

| Field | Description |
| --- | --- |
| `required` | Requires a non-empty answer. |
| `type: number` | Requires a numeric answer. |
| `type: date` | Requires day, month and year to form a real date. |
| `min` | Minimum numeric value. |
| `max` | Maximum numeric value. |
| `items` | Per-field validation for `text_group`. |
| `conditional` | Validation for conditional reveal inputs. |

For numeric questions, provide all relevant messages:

```yaml
validation:
  required: true
  type: number
  min: 1
  max: 120
errors:
  required:
    text: Enter the age you started smoking
  invalid:
    text: Enter the age you started smoking using numbers
  min:
    text: Age you started smoking must be 1 or older
  max:
    text: Age you started smoking must be 120 or younger
```

## Error hrefs

For simple questions, do not set `href`. The validator defaults it to `#${question.input.id}`.

Because `input.id` also defaults to the question ID, this means a question with `id: education` links to `#education`.

Only set `href` explicitly for exceptions:

- date inputs, usually `#dateOfBirth-day`
- `text_group` inputs, such as `#height-imperial-feet`
- conditional reveal inputs, such as `#years-stopped-smoking`
- tobacco flow questions where the input ID is intentionally dynamic or shared

## Variants

Use `variants` when the same question needs alternative content that is selected by the controller or flow logic.

```yaml
variants:
  previous:
    heading:
      title: The type of tobacco you have smoked
    input:
      label: What have you smoked?
```

Keep variants small. If a question becomes difficult to understand because it has too many variants, consider using separate question IDs instead.

## Hot reload

`questions.yaml` is reloaded automatically when it changes. You should not need to restart the server after editing valid YAML.

If the YAML file is invalid while you are editing it, the next request can fail until the file is valid again.
