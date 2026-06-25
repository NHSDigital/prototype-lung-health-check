# Content guide

This guide is for people editing question content in `questions.yaml` and `tobacco.yaml`.

## Question wording

Use `heading.title` for the page heading. Use `input.label` when the input needs a separate label from the page heading.

If there is no `input.label`, the page heading is used as the input label.

## Descriptions

Use `description` for content that should appear between the heading and the input. It supports Markdown.

Use `details` for supporting content that can be hidden behind a details component.

## Error messages

Write error messages so they make sense without reading the page heading.

For example:

- Use `Select whether you have ever smoked tobacco`
- Avoid `Select an option`

For dynamic tobacco questions, make sure the error message names the tobacco type or quantity being asked about where possible.

## Error links

Most questions do not need an explicit `href` in their error messages. The system links errors to the question input by default.

Only add an explicit `href` for grouped fields, dates, conditional reveal inputs or dynamic tobacco fields.

## Tobacco tense

Do not rely on string replacement for current and past tense tobacco questions.

Use explicit `current` and `past` wording in `tobacco.yaml`.
