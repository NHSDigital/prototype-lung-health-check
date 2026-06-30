# Prototype v4.4 documentation

Prototype v4.4 uses YAML-backed question content for most standard question pages.

## Main files

| File | Purpose |
| --- | --- |
| `data/questions.yaml` | Standard question content, options, validation and error messages. |
| `data/pages.yaml` | Page-level content, page types and question composition. |
| `data/tobacco.yaml` | Tobacco type content and tobacco sub-flow content variants. |
| `views/question-page.html` | Generic Nunjucks template for YAML-backed form pages. |
| `views/interruption-page.html` | Generic interruption page template. |
| `views/interstitial-page.html` | Generic interstitial page template. |
| `views/summary-page.html` | Generic scoped summary page template. |
| `views/stop-page.html` | Generic terminal stop page template. |
| `lib/questions.js` | Loads, normalises and hot-reloads YAML content. |
| `lib/question-renderer.js` | Renders YAML-backed question and non-question page templates. |
| `lib/question-validator.js` | Validates submitted answers using YAML validation rules. |
| `lib/tobacco-flow.js` | Builds and renders the repeated tobacco sub-flow. |
| `lib/summary.js` | Builds check your answers rows. |
| `controllers/question.js` | Handles route decisions and redirects. |

## How the pieces fit together

1. A route handler in `controllers/question.js` calls `renderQuestion`.
2. `renderQuestion` gets the question from `lib/questions.js`.
3. `lib/questions.js` loads content from `questions.yaml`, normalises it and returns the question by ID.
4. `question-page.html` renders the right NHS component for each question `type`.
5. On POST, the controller calls `validateQuestion`.
6. `question-validator.js` validates the submitted answer using the question's YAML rules.
7. If there are errors, the same question is rendered with error messages.
8. If validation passes, the controller decides the next route.

## Reference docs

- [Question schema](question-schema.md)
- [Page schema](page-schema.md)
- [Tobacco schema](tobacco-schema.md)
- [Content guide](content-guide.md)
- [Developer guide](developer-guide.md)
- [Question flow](question-flow.md)
- [Error messages](error-messages.md)

## Hot reload

The YAML content is reloaded automatically when `questions.yaml` or `tobacco.yaml` changes. You should not need to restart the server after editing valid YAML.

If YAML is invalid while it is being edited, the next request can fail until the file is valid again.
