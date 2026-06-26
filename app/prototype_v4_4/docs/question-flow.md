# Prototype v4.4 question flow

This diagram is based on `app/prototype_v4_4/routes.js`, `app/prototype_v4_4/controllers/authentication.js`, and `app/prototype_v4_4/controllers/question.js`.

```mermaid
flowchart TD
  start["Start page<br>/prototype_v4_4/start-page"] --> signIn["Sign in"]
  signIn --> securityCode["Security code"]
  securityCode --> agreement{"Share NHS login<br>information?"}
  agreement -- Accept --> terms["Accept terms"]
  agreement -- Decline --> agreementDeclined["Sign-in agreement declined<br>End"]

  terms --> phoneQuestionnaire{"Completed the questionnaire<br>by phone?"}
  phoneQuestionnaire -- Yes --> phoneExit["Phone questionnaire exit<br>End"]
  phoneQuestionnaire -- No --> smoker{"Are you a current or<br>former smoker?"}

  smoker -- No or fewer than 100 cigarettes in lifetime --> notEligibleScreening["Not eligible for screening<br>End"]
  smoker -- Yes --> dob{"Date of birth<br>Age 55 to 74?"}

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
  weightMetric --> gender["Gender identity"]
  weightImperial --> gender
  gender --> sex["Sex at birth"]
  sex --> ethnicity["Ethnic background"]
  ethnicity --> education["Education"]

  education --> smokingDuration["When you smoked tobacco<br>Age started, age stopped if applicable,<br>periods stopped"]
  smokingDuration --> smokingType{"Smoking type"}

  smokingType -- None selected --> smokingTypeExit["Smoking type exit<br>End"]
  smokingType -- One or more tobacco types --> tobaccoLoop["Repeat tobacco questions<br>for each selected type"]

  tobaccoLoop --> respiratory["Respiratory conditions"]
  respiratory --> asbestos["Asbestos<br>At work, at home"]
  asbestos --> cancerDiagnosis["Cancer diagnosis"]
  cancerDiagnosis --> relatives{"Close relative had<br>lung cancer?"}

  relatives -- Yes --> relativesAge["Relative diagnosed before 60?"]
  relatives -- No --> cya["Check your answers"]
  relativesAge --> cya

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
  selectedType["Next selected tobacco type"] --> formerSmoker{"Former smoker?"}

  formerSmoker -- No, currently smokes --> status["Smoking status"]
  formerSmoker -- Yes --> frequency["Smoking frequency"]
  status --> frequency
  frequency --> quantity["Smoking quantity"]

  quantity --> isShisha{"Is the selected type<br>shisha?"}
  isShisha -- Yes --> nextTypeOrCya
  isShisha -- No --> changed{"Smoking changed<br>over time?"}

  changed -- No change selected --> nextTypeOrCya
  changed -- More selected --> moreFrequency["More: smoking frequency"]
  moreFrequency --> moreQuantity["More: smoking quantity"]
  moreQuantity --> moreYears["More: smoking years"]
  moreYears --> fewerSelected{"Fewer also selected?"}

  changed -- Only fewer selected --> fewerFrequency["Fewer: smoking frequency"]
  fewerSelected -- Yes --> fewerFrequency
  fewerSelected -- No --> nextTypeOrCya
  fewerFrequency --> fewerQuantity["Fewer: smoking quantity"]
  fewerQuantity --> fewerYears["Fewer: smoking years"]
  fewerYears --> nextTypeOrCya

  nextTypeOrCya["Next selected tobacco type<br>or Check your answers"]
```

## Notes

- Height and weight unit pages can be switched manually using the unit-switch links.
- `When you smoked tobacco` combines age started smoking, age stopped smoking and periods stopped smoking.
- `Age stopped smoking` is shown on `When you smoked tobacco` when the `smoker` answer is `yes_previous`. It can also be shown again from check your answers if a tobacco-specific `Smoking status` answer is `no`.
- Smoking frequency and smoking quantity are separate pages.
- Changed-smoking frequency, quantity and years are separate pages.
- The tobacco subflow uses query strings such as `/prototype_v4_4/smoking-status?type=cigarettes` and `/prototype_v4_4/smoking-frequency-change?type=cigarettes&change=greater`.
- If the `smoker` answer is `yes_previous`, each tobacco type skips `Smoking status` and uses past-tense question text.
- Shisha follows the same smoking frequency and quantity flow as other tobacco types, but skips the smoking-change flow.
- If both `more` and `fewer` are selected for a tobacco type, the flow asks the `more` changed-smoking pages first, then the `fewer` changed-smoking pages.
- `Check your answers` links back to the last tobacco step that applies to the current set of answers.
