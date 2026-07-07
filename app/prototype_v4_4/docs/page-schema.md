# Prototype v4.4 page schema

`data/pages.yaml` defines page-level content. Question pages continue to compose controls from `data/questions.yaml`; non-question page types use shared templates.

## Page types

If `type` is omitted, the page is treated as a question page.

```yaml
- id: example-question
  questions:
    - smoker
```

Supported page types:

| `type` | Use |
| --- | --- |
| `question` | One or more form controls from `questions.yaml`. This is the default. |
| `interruption` | A visually prominent blue-panel page used to pause the journey for important information. |
| `interstitial` | An informational page between questions. |
| `summary` | An informational page with a scoped summary list and change links. |
| `stop` | A terminal page for a branch of the journey. |

## Shared fields

```yaml
- id: example-page
  type: interstitial
  heading:
    title: Page heading
    caption: Optional caption
  description: |
    Markdown content.
  insetText: |
    Optional inset text.
  details:
    summary: Optional details summary
    text: |
      Optional details content.
  button:
    text: Continue
  cancel:
    text: Cancel
```

`description`, `insetText` and `details.text` support Markdown. They can also use Nunjucks locals and filters, for example `{{ serviceTelephone | telephoneLink }}`.

## Stop pages

Stop pages are for terminal branches. They do not show a continue button unless the controller passes `actions.next`.

```yaml
- id: book-appointment
  type: stop
  heading:
    title: Call us to book an appointment
  description: |
    Call us on {{ serviceTelephone | telephoneLink }} to book an appointment.
  includes:
    - speak-to-a-gp
```

## Interruption pages

Interruption pages use the NHS interruption panel pattern. Their primary button uses the `nhsuk-button--reverse` modifier by default.

```yaml
- id: important-information
  type: interruption
  heading:
    title: Important information
  description: |
    Read this before continuing.
  button:
    text: Continue
  cancel:
    text: Cancel
```

Render from a controller with:

```js
renderInterruptionPage(req, res, 'important-information', {
  next: `/prototype_${version}/next-page`,
  back: `/prototype_${version}/previous-page`,
  cancel: `/prototype_${version}/`
})
```

## Interstitial pages

Interstitial pages use the same content fields without the blue panel.

```yaml
- id: smoking-history-start
  type: interstitial
  heading:
    title: Your smoking history
  description: |
    We will now ask about the types of tobacco you have smoked.
  button:
    text: Continue
```

Render from a controller with `renderInterstitialPage`.

## Summary pages

Summary pages reuse the same answer formatting and change links as check your answers, but only include the configured sections.

```yaml
- id: cigarette-summary
  type: summary
  heading:
    title: Check your cigarette answers
    caption: Your smoking history
  description: |
    Check the answers you gave about cigarettes.
  summary:
    tobaccoTypes:
      - cigarettes
  button:
    text: Continue
```

You can also include whole check-your-answers sections:

```yaml
summary:
  sections:
    - id: aboutYou
      heading: About you
    - id: health
      heading: Your health
```

Render from a controller with `renderSummaryPage`.
