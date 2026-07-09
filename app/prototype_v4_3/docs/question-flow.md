# Prototype v4.3 question flow

This diagram is based on:

- `app/prototype_v4_3/routes.js`
- `app/prototype_v4_3/controllers/authentication.js`
- `app/prototype_v4_3/controllers/question.js`

The diagrams use user-facing pages as process rectangles and branch-only routing logic as decision diamonds. Colours are grouped by category: grey for control and flow, blue for process, and green for data.

```mermaid
flowchart TD
  start([Start]) --> startPage["Start page<br>/prototype_v4_3/start-page"]
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
  phoneQuestionnaireDecision -- No --> smokingType["Smoking type"]

  smokingType --> smokingTypeDecision{"How many tobacco<br>types selected?"}
  smokingTypeDecision -- None selected --> smokingTypeExit["Smoking type exit"]
  smokingTypeExit --> smokingTypeExitEnd([End])
  smokingTypeDecision -- One tobacco type --> smokingStatus["Currently smoke<br>this tobacco type?"]
  smokingTypeDecision -- More than one tobacco type --> smokingStatusCurrent["Currently smoke any<br>selected tobacco types?"]

  smokingStatus --> smokingStatusDecision{"Eligible smoking<br>status?"}
  smokingStatusDecision -- Yes or no --> dob["Date of birth"]
  smokingStatusDecision -- Smoked fewer than<br>lifetime threshold --> notEligibleScreening["Not eligible for screening"]
  notEligibleScreening --> notEligibleScreeningEnd([End])
  smokingStatusCurrent --> dob

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
  education --> tobaccoLoop[["Repeat tobacco questions<br>for each selected type"]]

  tobaccoLoop --> respiratoryConditions["Respiratory conditions"]
  respiratoryConditions --> asbestos["Asbestos"]
  asbestos --> cancerDiagnosis["Cancer diagnosis"]
  cancerDiagnosis --> cancerDiagnosisRelatives["Relatives diagnosed<br>with lung cancer?"]
  cancerDiagnosisRelatives --> cancerDiagnosisRelativesDecision{"Relatives diagnosed<br>with lung cancer?"}
  cancerDiagnosisRelativesDecision -- Yes --> cancerDiagnosisRelativesAge["Relatives diagnosed<br>under 60?"]
  cancerDiagnosisRelativesDecision -- No or do not know --> cya["Check your answers"]
  cancerDiagnosisRelativesAge --> cya
  cya --> confirmation
  confirmation@{ shape: doc, label: "Confirmation" }
  confirmation --> flowComplete([End])
  classDef controlFlow fill:#dbe0e3,stroke:#4c6272,color:#212b32,stroke-width:2px
  classDef process fill:#d7e8f7,stroke:#005eb8,color:#212b32,stroke-width:2px
  classDef data fill:#d9f3f0,stroke:#00a499,color:#212b32,stroke-width:2px
  linkStyle default stroke:#4c6272,stroke-width:2px
  class ageDecision,agreementDecision,agreementDeclinedEnd,bookAppointmentEnd,cancerDiagnosisRelativesDecision,faceToFaceDecision,flowComplete,heightUnit,notEligibleScanEnd,notEligibleScreeningEnd,phoneExitEnd,phoneQuestionnaireDecision,smokingStatusDecision,smokingTypeDecision,smokingTypeExitEnd,start,weightUnit controlFlow
  class agreement,agreementDeclined,asbestos,bookAppointment,cancerDiagnosis,cancerDiagnosisRelatives,cancerDiagnosisRelativesAge,cya,dob,education,ethnicity,faceToFace,gender,heightImperial,heightMetric,notEligibleScan,notEligibleScreening,phoneExit,phoneQuestionnaire,respiratoryConditions,securityCode,sex,signIn,smokingStatus,smokingStatusCurrent,smokingType,smokingTypeExit,startPage,terms,tobaccoLoop,weightImperial,weightMetric process
  class confirmation data
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
  selectedType{{Next selected tobacco type}} --> duration["Smoking duration<br>Age started, age stopped if past,<br>periods stopped"]
  duration --> tobaccoSmoking["Tobacco smoking<br>Frequency and quantity"]

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
  moreTypes -- No --> health((Your health))
  classDef controlFlow fill:#dbe0e3,stroke:#4c6272,color:#212b32,stroke-width:2px
  classDef process fill:#d7e8f7,stroke:#005eb8,color:#212b32,stroke-width:2px
  classDef data fill:#d9f3f0,stroke:#00a499,color:#212b32,stroke-width:2px
  linkStyle default stroke:#4c6272,stroke-width:2px
  class changedDecision,fewerSelected,health,isShisha,moreTypes,nextType controlFlow
  class changed,duration,fewerChange,moreChange,selectedType,tobaccoSmoking process
```

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

## Notes

- Height and weight unit pages can be switched manually using the unit-switch links.
- `Smoking type` is shown immediately after `Phone questionnaire`.
- `Smoking status` is shown when one tobacco type is selected.
- On `Smoking status`, selecting the lifetime threshold option, for example that they have smoked fewer than 100 cigarettes in their lifetime, sends the user to `Not eligible for screening`.
- `Smoking status current` is shown when more than one tobacco type is selected. It asks which selected types the user currently smokes.
- `Date of birth`, `Face to face appointment`, `Height`, `Weight`, `Gender identity`, `Sex at birth`, `Ethnic background` and `Education` are shown after `Smoking status` or `Smoking status current`.
- `Gender identity`, `Sex at birth`, `Ethnic background` and `Education` are shown as separate pages.
- `Smoking duration` is part of the tobacco subflow and repeats for each selected tobacco type. It combines age started smoking, age quit smoking and periods stopped smoking.
- `Age quit smoking` is shown on `Smoking duration` when the selected tobacco type is past tense.
- `Tobacco smoking` combines smoking frequency and smoking quantity.
- `Tobacco smoking change` combines changed-smoking frequency, quantity and years.
- The tobacco subflow uses query strings such as `/prototype_v4_3/smoking-duration?type=cigarettes` and `/prototype_v4_3/tobacco-smoking-change?type=cigarettes&change=greater`.
- Single-type flows use present tense when `Smoking status` is `yes` and past tense when it is `no`.
- Multi-type flows use present tense for tobacco types selected on `Smoking status current`, and past tense for selected tobacco types not selected on `Smoking status current`.
- Shisha follows the same tobacco-smoking flow as other tobacco types, but skips the smoking-change flow.
- If both `more` and `fewer` are selected for a tobacco type, the flow asks the `more` tobacco-smoking-change page first, then the `fewer` tobacco-smoking-change page.
- The last tobacco step links onward to `Respiratory conditions`.
- `Cancer diagnosis relatives age` is shown only when `Cancer diagnosis relatives` is `yes`.
- `Check your answers` links back to `Cancer diagnosis relatives age` when it was shown, otherwise it links back to `Cancer diagnosis relatives`.
