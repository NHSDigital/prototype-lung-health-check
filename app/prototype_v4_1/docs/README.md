# Prototype v4.1 documentation

Prototype v4.1 uses YAML-backed question content for most standard question pages.

## Main files

| File | Purpose |
| --- | --- |
| `data/questions.yaml` | Standard question content, options, validation and error messages. |
| `data/tobacco.yaml` | Tobacco type content and tobacco sub-flow content variants. |
| `views/questions/_question.html` | Generic Nunjucks template for YAML-backed questions. |
| `lib/questions.js` | Loads, normalises and hot-reloads YAML content. |
| `lib/question-renderer.js` | Renders a YAML-backed question through the generic template. |
| `lib/question-validator.js` | Validates submitted answers using YAML validation rules. |
| `lib/tobacco-flow.js` | Builds and renders the repeated tobacco sub-flow. |
| `lib/summary.js` | Builds check your answers rows. |
| `controllers/question.js` | Handles route decisions and redirects. |

## How the pieces fit together

1. A route handler in `controllers/question.js` calls `renderQuestion`.
2. `renderQuestion` gets the question from `lib/questions.js`.
3. `lib/questions.js` loads content from `questions.yaml`, normalises it and returns the question by ID.
4. `_question.html` renders the right NHS component for the question `type`.
5. On POST, the controller calls `validateQuestion`.
6. `question-validator.js` validates the submitted answer using the question's YAML rules.
7. If there are errors, the same question is rendered with error messages.
8. If validation passes, the controller decides the next route.

## Reference docs

- [Question schema](question-schema.md)
- [Tobacco schema](tobacco-schema.md)
- [Content guide](content-guide.md)
- [Developer guide](developer-guide.md)
- [Question flow](question-flow.md)
- [Error messages](error-messages.md)

## Hot reload

The YAML content is reloaded automatically when `questions.yaml` or `tobacco.yaml` changes. You should not need to restart the server after editing valid YAML.

If YAML is invalid while it is being edited, the next request can fail until the file is valid again.
