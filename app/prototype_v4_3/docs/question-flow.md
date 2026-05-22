# Prototype v4.3 question flow

This diagram is based on `app/prototype_v4_3/routes.js`, `app/prototype_v4_3/controllers/authentication.js`, and `app/prototype_v4_3/controllers/question.js`.

```mermaid
flowchart TD
  start["Start page<br>/prototype_v4_3/start-page"] --> signIn["Sign in"]
  signIn --> securityCode["Security code"]
  securityCode --> agreement{"Share NHS login<br>information?"}
  agreement -- Accept --> terms["Accept terms"]
  agreement -- Decline --> agreementDeclined["Sign-in agreement declined<br>End"]

  terms --> phoneQuestionnaire{"Completed the questionnaire<br>by phone?"}
  phoneQuestionnaire -- Yes --> phoneExit["Phone questionnaire exit<br>End"]
  phoneQuestionnaire -- No --> smokingType{"Smoking type"}

  smokingType -- None selected --> smokingTypeExit["Smoking type exit<br>End"]
  smokingType -- One tobacco type --> smokingStatus{"Currently smoke<br>this tobacco type?"}
  smokingType -- More than one tobacco type --> smokingStatusCurrent{"Currently smoke any<br>selected tobacco types?"}

  smokingStatus --> dob{"Date of birth<br>Age 55 to 74?"}
  smokingStatusCurrent --> dob

  dob -- No --> notEligibleScan["Not eligible for scan<br>End"]
  dob -- Yes --> faceToFace{"Need a face to face<br>appointment?"}

  faceToFace -- Yes --> bookAppointment["Book appointment<br>End"]
  faceToFace -- No --> height{"Height"}

  height -- Metric --> heightMetric["Height - metric"]
  height -- Imperial --> heightImperial["Height - imperial"]
  heightMetric --> weight
  heightImperial --> weight

  weight{"Weight"} -- Metric --> weightMetric["Weight - metric"]
  weight -- Imperial --> weightImperial["Weight - imperial"]
  weightMetric --> tobaccoLoop["Repeat tobacco questions<br>for each selected type"]
  weightImperial --> tobaccoLoop

  tobaccoLoop --> cya["Check your answers"]
  cya --> confirmation["Confirmation<br>End"]
```

## Tobacco subflow

The tobacco questions repeat for each selected tobacco type, in this order:

1. Cigarettes
2. Rolling tobacco
3. Pipes
4. Small cigars
5. Medium cigars
6. Large cigars
7. Cigarillos
8. Shisha

```mermaid
flowchart TD
  selectedType["Next selected tobacco type"] --> duration["Smoking duration<br>Age started, age stopped if past,<br>periods stopped"]
  duration --> tobaccoSmoking["Tobacco smoking<br>Frequency and quantity"]

  tobaccoSmoking --> isShisha{"Is the selected type<br>shisha?"}
  isShisha -- Yes --> nextTypeOrCya
  isShisha -- No --> changed{"Smoking changed<br>over time?"}

  changed -- No change selected --> nextTypeOrCya
  changed -- More selected --> moreChange["Tobacco smoking change<br>More: frequency, quantity and years"]
  moreChange --> fewerSelected{"Fewer also selected?"}

  changed -- Only fewer selected --> fewerChange["Tobacco smoking change<br>Fewer: frequency, quantity and years"]
  fewerSelected -- Yes --> fewerChange
  fewerSelected -- No --> nextTypeOrCya
  fewerChange --> nextTypeOrCya

  nextTypeOrCya["Next selected tobacco type<br>or Check your answers"]
```

## Notes

- Height and weight unit pages can be switched manually using the unit-switch links.
- `Smoking type` is shown immediately after `Phone questionnaire`.
- `Smoking status` is shown when one tobacco type is selected.
- `Smoking status current` is shown when more than one tobacco type is selected. It asks which selected types the user currently smokes.
- `Date of birth`, `Face to face appointment`, `Height` and `Weight` are shown after `Smoking status` or `Smoking status current`.
- `Smoking duration` is part of the tobacco subflow and repeats for each selected tobacco type. It combines age started smoking, age stopped smoking and periods stopped smoking.
- `Age stopped smoking` is shown on `Smoking duration` when the selected tobacco type is past tense.
- `Tobacco smoking` combines smoking frequency and smoking quantity.
- `Tobacco smoking change` combines changed-smoking frequency, quantity and years.
- The tobacco subflow uses query strings such as `/prototype_v4_3/smoking-duration?type=cigarettes` and `/prototype_v4_3/tobacco-smoking-change?type=cigarettes&change=greater`.
- Single-type flows use present tense when `Smoking status` is `yes` and past tense when it is `no`.
- Multi-type flows use present tense for tobacco types selected on `Smoking status current`, and past tense for selected tobacco types not selected on `Smoking status current`.
- Shisha follows the same tobacco-smoking flow as other tobacco types, but skips the smoking-change flow.
- If both `more` and `fewer` are selected for a tobacco type, the flow asks the `more` tobacco-smoking-change page first, then the `fewer` tobacco-smoking-change page.
- `Check your answers` links back to the last tobacco step that applies to the current set of answers.
- `About you`, `Your health` and `Family history` pages still exist in the prototype, but they are not part of this flow.
