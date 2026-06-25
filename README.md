# Check if you need a lung scan prototype

A digital questionnaire prototype for lung cancer screening eligibility and risk
assessment, built with the NHS prototype kit.

The prototype explores whether people can complete parts of the lung cancer
screening questionnaire online instead of completing the whole assessment by
phone.

## Current prototype

The latest version is **prototype v4.4**.

- Start page: `/prototype_v4_4/start-page`
- Page index: `/prototype_v4_4/page-index`
- Last updated in the prototype index: 25 June 2026

The app also keeps earlier versions available for comparison and research
review:

- `prototype_v4_3`
- `prototype_v4_2`
- `prototype_v4_1`
- `prototype_v4`
- `prototype_v3`
- `prototype_v2`
- `prototype_v1`

## What v4.4 includes

Prototype v4.4 includes:

- simulated NHS login and security code pages
- terms acceptance
- an exit route for people who have already completed the questionnaire by phone
- eligibility checks for smoking history and age
- a route for people who need a face-to-face appointment
- height, weight, gender identity, sex at birth, ethnicity and education questions
- smoking history and tobacco type questions
- repeated tobacco questions for cigarettes, rolling tobacco, pipes, cigars,
  cigarillos and shisha
- respiratory conditions, asbestos, cancer diagnosis and family history questions
- check your answers and confirmation pages
- content pages for accessibility, contact, cookies, privacy, terms, paused and
  closed service states
- 404, 500 and 503 error pages

The v4.4 flow is documented in
[`app/prototype_v4_4/docs/question-flow.md`](app/prototype_v4_4/docs/question-flow.md).

## Content and data

Prototype v4.4 uses YAML-backed content for most standard question pages:

- `app/prototype_v4_4/data/questions.yaml` for reusable question controls
- `app/prototype_v4_4/data/pages.yaml` for page composition
- `app/prototype_v4_4/data/tobacco.yaml` for tobacco-specific content and
  repeated tobacco sub-flows

The YAML content hot-reloads while the app is running. If invalid YAML is saved,
the next request can fail until the file is fixed.

Version-specific documentation is in
[`app/prototype_v4_4/docs`](app/prototype_v4_4/docs).

Shared project documentation is in [`docs`](docs), including:

- a contribution guide
- risk calculator notes
- tobacco cigarette-equivalent notes and CSV data
- a modelling note about concurrent and consecutive tobacco smoking

## Risk calculators

The repository includes shared prototype-only `LLPv2` and `PLCOm2012` calculator
modules in `app/lib/risk-calculators`.

These modules are not currently wired into the v4.4 journey to decide whether a
person is high risk or low risk. The next implementation step is an adapter that
maps prototype session answers to calculator inputs and owns thresholds, missing
answer handling, cigarette-equivalent mapping and result page routing.

Calculator results are not clinically signed off and must not be used to make
clinical decisions.

See [`docs/risk-calculators.md`](docs/risk-calculators.md).

## Running locally

Use the project Node and npm versions:

- Node 24
- npm 11

Install dependencies and start the prototype:

```bash
npm install
npm start
```

The prototype runs at `http://localhost:3000`.

## Useful commands

```bash
npm run lint:markdown
npm run lint:scripts
npm run lint:styles
```

## Research status

This is a research prototype for user testing and service design work. It is not
intended for clinical use.

## Contributing

For non-technical contribution guidance, see
[`docs/contributing-to-the-prototype.md`](docs/contributing-to-the-prototype.md).

## Licence

This prototype is built using the NHS prototype kit and follows the same
licensing terms.
