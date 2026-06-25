# Developer guide

This guide explains the common development tasks for YAML-backed questions in prototype v4.1.

## Add a standard question

1. Add the question to `data/questions.yaml`.
2. Use a stable kebab-case `id`.
3. Add `answerKey` if the default camel-case key is not right.
4. Add validation and error messages if the question is required.
5. Add GET and POST handlers in `controllers/question.js`.
6. Use `renderQuestion` in the GET handler.
7. Use `validateQuestion` in the POST handler.
8. Update routes.
9. Update check your answers if the answer should appear there.

## Add validation

Use YAML validation where possible:

- `required`
- `type: number`
- `type: date`
- `min`
- `max`
- `items` for `text_group`
- `conditional` for conditional reveal inputs

Keep custom validation in code only when the rule depends on wider service logic.

## Add a tobacco type

1. Add an option to the `smoking-type` question in `questions.yaml`.
2. Add a matching key in `tobacco.yaml` under `tobaccoTypes`.
3. Add current and past headings.
4. Add quantity units and suffixes if answers need units.
5. Check the tobacco sub-flow and check your answers output.

## Check changes

Run Standard against the prototype files after JavaScript changes:

```bash
npx standard app/prototype_v4_4/controllers/question.js app/prototype_v4_4/lib/*.js
```

You can also require the controller to catch syntax errors:

```bash
node -e "require('./app/prototype_v4_4/controllers/question')"
```
