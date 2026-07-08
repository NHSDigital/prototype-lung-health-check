# Prototype v4.2 question flow

This diagram is based on `app/prototype_v4_2/routes.js`, `app/prototype_v4_2/controllers/authentication.js`, and `app/prototype_v4_2/controllers/question.js`.

The diagrams use user-facing pages as process rectangles and branch-only routing logic as decision diamonds.

## Symbol key

| Symbol | Mermaid syntax | Used for |
| --- | --- | --- |
| Stadium | `node([Label])` | Start and end points |
| Rectangle | `node["Label"]` | User-facing pages and single process steps |
| Diamond | `node{"Label"}` | Routing decisions |
| Circle | `node((Label))` | Connectors between repeated sections |
| Double-sided rectangle | `node[["Label"]]` | Predefined or repeated sub-processes |
| Hexagon | `node{{"Label"}}` | Preparation steps |
| Document | `node@{ shape: doc, label: "Label" }` | Output documents or reports |

```mermaid
flowchart TD
  start([Start]) --> startPage["Start page<br>/prototype_v4_2/start-page"]
  startPage --> signIn["Sign in"]
  signIn --> securityCode["Security code"]
  securityCode --> agreement["Share NHS login<br>information?"]
  agreement --> agreementDecision{"Accepted?"}
  agreementDecision -- Yes --> terms["Accept terms"]
  agreementDecision -- No --> agreementDeclined["Sign-in agreement declined"]
  agreementDeclined --> agreementDeclinedEnd([End])

  terms --> phoneQuestionnaire["Completed the questionnaire<br>by phone?"]
  phoneQuestionnaire --> phoneQuestionnaireDecision{"Completed by phone?"}
  phoneQuestionnaireDecision -- Yes --> phoneExit["Phone questionnaire exit"]
  phoneExit --> phoneExitEnd([End])
  phoneQuestionnaireDecision -- No --> smoker["Are you a current or<br>former smoker?"]

  smoker --> smokerDecision{"Eligible smoker?"}
  smokerDecision -- No or fewer than 100 cigarettes in lifetime --> notEligibleScreening["Not eligible for screening"]
  notEligibleScreening --> notEligibleScreeningEnd([End])
  smokerDecision -- Yes --> dob["Date of birth"]

  dob --> ageDecision{"Age 55 to 74?"}
  ageDecision -- No --> notEligibleScan["Not eligible for scan"]
  notEligibleScan --> notEligibleScanEnd([End])
  ageDecision -- Yes --> faceToFace["Need a face to face<br>appointment?"]

  faceToFace --> faceToFaceDecision{"Needs face-to-face<br>appointment?"}
  faceToFaceDecision -- Yes --> bookAppointment["Book appointment"]
  bookAppointment --> bookAppointmentEnd([End])
  faceToFaceDecision -- No --> heightUnit{"Height unit?"}

  heightUnit -- Metric/default --> heightMetric["Height - metric"]
  heightUnit -- Imperial --> heightImperial["Height - imperial"]
  heightMetric --> weightUnit
  heightImperial --> weightUnit

  weightUnit{"Weight unit?"}
  weightUnit -- Metric/default --> weightMetric["Weight - metric"]
  weightUnit -- Imperial --> weightImperial["Weight - imperial"]
  weightMetric --> gender["Gender identity"]
  weightImperial --> gender
  gender --> sex["Sex at birth"]
  sex --> ethnicity["Ethnic background"]
  ethnicity --> education["Education"]

  education --> smokingDuration["When you smoked tobacco<br>Age started, age stopped if applicable,<br>periods stopped"]
  smokingDuration --> smokingType["Smoking type"]

  smokingType --> smokingTypeDecision{"Any tobacco type<br>selected?"}
  smokingTypeDecision -- No, none selected --> smokingTypeExit["Smoking type exit"]
  smokingTypeExit --> smokingTypeExitEnd([End])
  smokingTypeDecision -- Yes --> tobaccoLoop[["Repeat tobacco questions<br>for each selected type"]]

  tobaccoLoop --> respiratory["Respiratory conditions"]
  respiratory --> asbestos["Asbestos<br>At work, at home"]
  asbestos --> cancerDiagnosis["Cancer diagnosis"]
  cancerDiagnosis --> relatives["Close relative had<br>lung cancer?"]

  relatives --> relativesDecision{"Relative had<br>lung cancer?"}
  relativesDecision -- Yes --> relativesAge["Relative diagnosed before 60?"]
  relativesDecision -- No --> cya["Check your answers"]
  relativesAge --> cya

  cya --> confirmation
  confirmation@{ shape: doc, label: "Confirmation" }
  confirmation --> flowComplete([End])
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
  selectedType{{Next selected tobacco type}} --> formerSmokerDecision{"Former smoker?"}

  formerSmokerDecision -- No, currently smokes --> status["Smoking status"]
  formerSmokerDecision -- Yes --> tobaccoSmoking["Tobacco smoking<br>Frequency and quantity"]
  status --> tobaccoSmoking

  tobaccoSmoking --> isShisha{"Is the selected type<br>shisha?"}
  isShisha -- Yes --> moreTypes
  isShisha -- No --> changed["Smoking changed<br>over time?"]

  changed --> changedDecision{"Change selected?"}
  changedDecision -- No change selected --> moreTypes
  changedDecision -- More selected --> moreChange["Tobacco smoking change<br>More: frequency, quantity and years"]
  moreChange --> fewerSelected{"Fewer also selected?"}

  changedDecision -- Only fewer selected --> fewerChange["Tobacco smoking change<br>Fewer: frequency, quantity and years"]
  fewerSelected -- Yes --> fewerChange
  fewerSelected -- No --> moreTypes
  fewerChange --> moreTypes

  moreTypes{"More selected<br>tobacco types?"}
  moreTypes -- Yes --> nextType((Next type))
  nextType --> selectedType
  moreTypes -- No --> cya((Check your answers))
```

## Notes

- Height and weight unit pages can be switched manually using the unit-switch links.
- `When you smoked tobacco` combines age started smoking, age stopped smoking and periods stopped smoking.
- `Age stopped smoking` is shown on `When you smoked tobacco` when the `smoker` answer is `yes_previous`. It can also be shown again from check your answers if a tobacco-specific `Smoking status` answer is `no`.
- `Tobacco smoking` combines smoking frequency and smoking quantity.
- `Tobacco smoking change` combines changed-smoking frequency, quantity and years.
- The tobacco subflow uses query strings such as `/prototype_v4_2/smoking-status?type=cigarettes` and `/prototype_v4_2/tobacco-smoking-change?type=cigarettes&change=greater`.
- If the `smoker` answer is `yes_previous`, each tobacco type skips `Smoking status` and uses past-tense question text.
- Shisha follows the same tobacco-smoking flow as other tobacco types, but skips the smoking-change flow.
- If both `more` and `fewer` are selected for a tobacco type, the flow asks the `more` tobacco-smoking-change page first, then the `fewer` tobacco-smoking-change page.
- `Check your answers` links back to the last tobacco step that applies to the current set of answers.
