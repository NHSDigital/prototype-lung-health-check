const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const version = 'v4'
const viewsDirectory = path.join(__dirname, 'views')

const view = (template) => {
  return `prototype_${version}/views/${template}`
}

const hasView = (template) => {
  if (!template || template.includes('..')) {
    return false
  }

  const templatePath = path.join(viewsDirectory, `${template}.html`)
  return templatePath.startsWith(viewsDirectory) && fs.existsSync(templatePath)
}

/// ------------------------------------------------------------------------ ///
/// Controller modules - used for routing
/// ------------------------------------------------------------------------ ///

const authenticationController = require('./controllers/authentication')
const contentController = require('./controllers/content')
const errorController = require('./controllers/error')
const questionController = require('./controllers/question')

/// ------------------------------------------------------------------------ ///
/// Start page
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4', (req, res) => {
  res.redirect('/prototype_v4/start-page')
})

router.get('/prototype_v4/start-page', (req, res) => {
  res.render(view('index'), {
    actions: {
      start: '/prototype_v4/sign-in'
    }
  })
})

/// ------------------------------------------------------------------------ ///
/// Sign-in pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/sign-in', authenticationController.signIn_get)
router.post('/prototype_v4/sign-in', authenticationController.signIn_post)

router.get('/prototype_v4/security-code', authenticationController.securityCode_get)
router.post('/prototype_v4/security-code', authenticationController.securityCode_post)

router.get('/prototype_v4/sign-in-agreement', authenticationController.signInAgreement_get)
router.post('/prototype_v4/sign-in-agreement', authenticationController.signInAgreement_post)

router.get('/prototype_v4/sign-in-agreement-declined', authenticationController.signInAgreementDeclined_get)

/// ------------------------------------------------------------------------ ///
/// Terms and conditions page
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/accept-terms', questionController.acceptTerms_get)
router.post('/prototype_v4/accept-terms', questionController.acceptTerms_post)

/// ------------------------------------------------------------------------ ///
/// Question pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/phone-questionnaire', questionController.phoneQuestionnaire_get)
router.post('/prototype_v4/phone-questionnaire', questionController.phoneQuestionnaire_post)

router.get('/prototype_v4/phone-questionnaire-exit', questionController.phoneQuestionnaireExit_get)

/// Eligibility ------------------------------------------------------------ ///

router.get('/prototype_v4/smoker', questionController.smoker_get)
router.post('/prototype_v4/smoker', questionController.smoker_post)

router.get('/prototype_v4/date-of-birth', questionController.dateOfBirth_get)
router.post('/prototype_v4/date-of-birth', questionController.dateOfBirth_post)

router.get('/prototype_v4/face-to-face-appointment', questionController.faceToFaceAppointment_get)
router.post('/prototype_v4/face-to-face-appointment', questionController.faceToFaceAppointment_post)

router.get('/prototype_v4/not-eligible-for-screening', questionController.notEligibleForScreening_get)

router.get('/prototype_v4/not-eligible-for-scan', questionController.notEligibleForScan_get)

router.get('/prototype_v4/book-appointment', questionController.bookAppointment_get)


/// About you -------------------------------------------------------------- ///

router.get('/prototype_v4/height-metric', questionController.heightMetric_get)
router.post('/prototype_v4/height-metric', questionController.heightMetric_post)

router.get('/prototype_v4/height-imperial', questionController.heightImperial_get)
router.post('/prototype_v4/height-imperial', questionController.heightImperial_post)

router.get('/prototype_v4/weight-metric', questionController.weightMetric_get)
router.post('/prototype_v4/weight-metric', questionController.weightMetric_post)

router.get('/prototype_v4/weight-imperial', questionController.weightImperial_get)
router.post('/prototype_v4/weight-imperial', questionController.weightImperial_post)

router.get('/prototype_v4/sex', questionController.sex_get)
router.post('/prototype_v4/sex', questionController.sex_post)

router.get('/prototype_v4/gender', questionController.gender_get)
router.post('/prototype_v4/gender', questionController.gender_post)

router.get('/prototype_v4/ethnicity', questionController.ethnicity_get)
router.post('/prototype_v4/ethnicity', questionController.ethnicity_post)

router.get('/prototype_v4/education', questionController.education_get)
router.post('/prototype_v4/education', questionController.education_post)

/// Your health ------------------------------------------------------------ ///

router.get('/prototype_v4/respiratory-conditions', questionController.respiratoryConditions_get)
router.post('/prototype_v4/respiratory-conditions', questionController.respiratoryConditions_post)

router.get('/prototype_v4/asbestos-at-work', questionController.asbestosAtWork_get)
router.post('/prototype_v4/asbestos-at-work', questionController.asbestosAtWork_post)

router.get('/prototype_v4/asbestos-at-home', questionController.asbestosAtHome_get)
router.post('/prototype_v4/asbestos-at-home', questionController.asbestosAtHome_post)

router.get('/prototype_v4/cancer-diagnosis', questionController.cancerDiagnosis_get)
router.post('/prototype_v4/cancer-diagnosis', questionController.cancerDiagnosis_post)

/// Family history --------------------------------------------------------- ///

router.get('/prototype_v4/cancer-diagnosis-relatives', questionController.cancerDiagnosisRelatives_get)
router.post('/prototype_v4/cancer-diagnosis-relatives', questionController.cancerDiagnosisRelatives_post)

router.get('/prototype_v4/cancer-diagnosis-relatives-age', questionController.cancerDiagnosisRelativesAge_get)
router.post('/prototype_v4/cancer-diagnosis-relatives-age', questionController.cancerDiagnosisRelativesAge_post)

/// Smoking habits --------------------------------------------------------- ///

router.get('/prototype_v4/age-started-smoking', questionController.ageStartedSmoking_get)
router.post('/prototype_v4/age-started-smoking', questionController.ageStartedSmoking_post)

router.get('/prototype_v4/periods-stopped-smoking', questionController.periodsStoppedSmoking_get)
router.post('/prototype_v4/periods-stopped-smoking', questionController.periodsStoppedSmoking_post)

/// Tobacco --------------------------------------------------------------- ///

router.get('/prototype_v4/type-of-smoking', questionController.typeOfSmoking_get)
router.post('/prototype_v4/type-of-smoking', questionController.typeOfSmoking_post)

router.get('/prototype_v4/type-of-smoking-exit', questionController.typeOfSmokingExit_get)

router.get('/prototype_v4/smoking-frequency', questionController.smokingFrequency_get)
router.post('/prototype_v4/smoking-frequency', questionController.smokingFrequency_post)

router.get('/prototype_v4/smoking-quantity', questionController.smokingQuantity_get)
router.post('/prototype_v4/smoking-quantity', questionController.smokingQuantity_post)

router.get('/prototype_v4/smoking-setting', questionController.smokingSetting_get)
router.post('/prototype_v4/smoking-setting', questionController.smokingSetting_post)

router.get('/prototype_v4/smoking-change', questionController.smokingChange_get)
router.post('/prototype_v4/smoking-change', questionController.smokingChange_post)

/// ------------------------------------------------------------------------ ///
/// Static pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/accessibility-statement', contentController.accessibility)

router.get('/prototype_v4/contact-us', contentController.contact)

router.get('/prototype_v4/cookies', contentController.cookies)

router.get('/prototype_v4/privacy-policy', contentController.privacy)

router.get('/prototype_v4/terms-of-use', contentController.terms)

/// ------------------------------------------------------------------------ ///
/// Error pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/404', errorController.pageNotFound)
router.get('/prototype_v4/page-not-found', errorController.pageNotFound)

router.get('/prototype_v4/500', errorController.unexpectedError)
router.get('/prototype_v4/server-error', errorController.unexpectedError)

router.get('/prototype_v4/503', errorController.serviceUnavailable)
router.get('/prototype_v4/service-unavailable', errorController.serviceUnavailable)

/// ------------------------------------------------------------------------ ///
/// Add your routes above
/// ------------------------------------------------------------------------ ///

router.get(/^\/prototype_v4\/(.+)$/, (req, res, next) => {
  const template = req.params[0]

  if (!hasView(template)) {
    return errorController.pageNotFound(req, res)
  }

  res.render(view(template))
})

module.exports = router
