const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const settings = require('./lib/settings')

const { path: prototypePath, version, view } = settings
const viewsDirectory = path.join(__dirname, 'views')

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
const { getDefaultAnswerProfile, getIndexRedirect } = require('./lib/page-index')
const questionController = require('./controllers/question')

router.use((req, res, next) => {
  res.locals.prototype = settings.locals
  next()
})

/// ------------------------------------------------------------------------ ///
/// Start page
/// ------------------------------------------------------------------------ ///

router.get(prototypePath, (req, res) => {
  res.redirect(`${prototypePath}/start-page`)
})

router.get(`${prototypePath}/start-page`, (req, res) => {
  res.render(view('start'), {
    actions: {
      start: `${prototypePath}/sign-in`
    }
  })
})

/// ------------------------------------------------------------------------ ///
/// Sign-in pages
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/sign-in`, authenticationController.signIn_get)
router.post(`/prototype_${version}/sign-in`, authenticationController.signIn_post)

router.get(`/prototype_${version}/security-code`, authenticationController.securityCode_get)
router.post(`/prototype_${version}/security-code`, authenticationController.securityCode_post)

router.get(`/prototype_${version}/sign-in-agreement`, authenticationController.signInAgreement_get)
router.post(`/prototype_${version}/sign-in-agreement`, authenticationController.signInAgreement_post)

router.get(`/prototype_${version}/sign-in-agreement-declined`, authenticationController.signInAgreementDeclined_get)

/// ------------------------------------------------------------------------ ///
/// Terms and conditions page
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/accept-terms`, questionController.acceptTerms_get)
router.post(`/prototype_${version}/accept-terms`, questionController.acceptTerms_post)

/// ------------------------------------------------------------------------ ///
/// Question pages
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/phone-questionnaire`, questionController.phoneQuestionnaire_get)
router.post(`/prototype_${version}/phone-questionnaire`, questionController.phoneQuestionnaire_post)

router.get(`/prototype_${version}/phone-questionnaire-exit`, questionController.phoneQuestionnaireExit_get)

/// Eligibility ------------------------------------------------------------ ///

router.get(`/prototype_${version}/smoker`, questionController.smoker_get)
router.post(`/prototype_${version}/smoker`, questionController.smoker_post)

router.get(`/prototype_${version}/date-of-birth`, questionController.dateOfBirth_get)
router.post(`/prototype_${version}/date-of-birth`, questionController.dateOfBirth_post)

router.get(`/prototype_${version}/face-to-face-appointment`, questionController.faceToFaceAppointment_get)
router.post(`/prototype_${version}/face-to-face-appointment`, questionController.faceToFaceAppointment_post)

router.get(`/prototype_${version}/not-eligible-for-screening`, questionController.notEligibleForScreening_get)

router.get(`/prototype_${version}/not-eligible-for-scan`, questionController.notEligibleForScan_get)

router.get(`/prototype_${version}/book-appointment`, questionController.bookAppointment_get)

/// About you -------------------------------------------------------------- ///

router.get(`/prototype_${version}/height-metric`, questionController.heightMetric_get)
router.post(`/prototype_${version}/height-metric`, questionController.heightMetric_post)

router.get(`/prototype_${version}/height-imperial`, questionController.heightImperial_get)
router.post(`/prototype_${version}/height-imperial`, questionController.heightImperial_post)

router.get(`/prototype_${version}/weight-metric`, questionController.weightMetric_get)
router.post(`/prototype_${version}/weight-metric`, questionController.weightMetric_post)

router.get(`/prototype_${version}/weight-imperial`, questionController.weightImperial_get)
router.post(`/prototype_${version}/weight-imperial`, questionController.weightImperial_post)

router.get(`/prototype_${version}/about-you`, questionController.aboutYou_get)
router.post(`/prototype_${version}/about-you`, questionController.aboutYou_post)

// router.get(`/prototype_${version}/sex`, questionController.sex_get)
// router.post(`/prototype_${version}/sex`, questionController.sex_post)

// router.get(`/prototype_${version}/gender`, questionController.gender_get)
// router.post(`/prototype_${version}/gender`, questionController.gender_post)

// router.get(`/prototype_${version}/ethnicity`, questionController.ethnicity_get)
// router.post(`/prototype_${version}/ethnicity`, questionController.ethnicity_post)

// router.get(`/prototype_${version}/education`, questionController.education_get)
// router.post(`/prototype_${version}/education`, questionController.education_post)

/// Your health ------------------------------------------------------------ ///

router.get(`/prototype_${version}/respiratory-conditions`, questionController.respiratoryConditions_get)
router.post(`/prototype_${version}/respiratory-conditions`, questionController.respiratoryConditions_post)

router.get(`/prototype_${version}/asbestos`, questionController.asbestos_get)
router.post(`/prototype_${version}/asbestos`, questionController.asbestos_post)

// router.get(`/prototype_${version}/asbestos-at-work`, questionController.asbestosAtWork_get)
// router.post(`/prototype_${version}/asbestos-at-work`, questionController.asbestosAtWork_post)

// router.get(`/prototype_${version}/asbestos-at-home`, questionController.asbestosAtHome_get)
// router.post(`/prototype_${version}/asbestos-at-home`, questionController.asbestosAtHome_post)

// router.get(`/prototype_${version}/cancer-history`, questionController.cancerHistory_get)
// router.post(`/prototype_${version}/cancer-history`, questionController.cancerHistory_post)

router.get(`/prototype_${version}/cancer-diagnosis`, questionController.cancerDiagnosis_get)
router.post(`/prototype_${version}/cancer-diagnosis`, questionController.cancerDiagnosis_post)

/// Family history --------------------------------------------------------- ///

router.get(`/prototype_${version}/cancer-diagnosis-relatives`, questionController.cancerDiagnosisRelatives_get)
router.post(`/prototype_${version}/cancer-diagnosis-relatives`, questionController.cancerDiagnosisRelatives_post)

router.get(`/prototype_${version}/cancer-diagnosis-relatives-age`, questionController.cancerDiagnosisRelativesAge_get)
router.post(`/prototype_${version}/cancer-diagnosis-relatives-age`, questionController.cancerDiagnosisRelativesAge_post)

/// Smoking habits --------------------------------------------------------- ///

router.get(`/prototype_${version}/smoking-duration`, questionController.smokingDuration_get)
router.post(`/prototype_${version}/smoking-duration`, questionController.smokingDuration_post)

router.get(`/prototype_${version}/age-started-smoking`, questionController.ageStartedSmoking_get)
router.post(`/prototype_${version}/age-started-smoking`, questionController.ageStartedSmoking_post)

router.get(`/prototype_${version}/age-stopped-smoking`, questionController.ageStoppedSmoking_get)
router.post(`/prototype_${version}/age-stopped-smoking`, questionController.ageStoppedSmoking_post)

router.get(`/prototype_${version}/periods-stopped-smoking`, questionController.periodsStoppedSmoking_get)
router.post(`/prototype_${version}/periods-stopped-smoking`, questionController.periodsStoppedSmoking_post)

/// Tobacco --------------------------------------------------------------- ///

router.get(`/prototype_${version}/smoking-type`, questionController.smokingType_get)
router.post(`/prototype_${version}/smoking-type`, questionController.smokingType_post)

router.get(`/prototype_${version}/tobacco-smoking`, questionController.tobaccoSmoking_get)
router.post(`/prototype_${version}/tobacco-smoking`, questionController.tobaccoSmoking_post)

router.get(`/prototype_${version}/smoking-type-exit`, questionController.smokingTypeExit_get)

router.get(`/prototype_${version}/smoking-status`, questionController.smokingStatus_get)
router.post(`/prototype_${version}/smoking-status`, questionController.smokingStatus_post)

router.get(`/prototype_${version}/smoking-frequency`, questionController.smokingFrequency_get)
router.post(`/prototype_${version}/smoking-frequency`, questionController.smokingFrequency_post)

router.get(`/prototype_${version}/smoking-quantity`, questionController.smokingQuantity_get)
router.post(`/prototype_${version}/smoking-quantity`, questionController.smokingQuantity_post)

router.get(`/prototype_${version}/smoking-change`, questionController.smokingChange_get)
router.post(`/prototype_${version}/smoking-change`, questionController.smokingChange_post)

router.get(`/prototype_${version}/tobacco-smoking-change`, questionController.tobaccoSmokingChange_get)
router.post(`/prototype_${version}/tobacco-smoking-change`, questionController.tobaccoSmokingChange_post)

router.get(`/prototype_${version}/smoking-frequency-change`, questionController.smokingFrequencyChange_get)
router.post(`/prototype_${version}/smoking-frequency-change`, questionController.smokingFrequencyChange_post)

router.get(`/prototype_${version}/smoking-quantity-change`, questionController.smokingQuantityChange_get)
router.post(`/prototype_${version}/smoking-quantity-change`, questionController.smokingQuantityChange_post)

router.get(`/prototype_${version}/smoking-years-change`, questionController.smokingYearsChange_get)
router.post(`/prototype_${version}/smoking-years-change`, questionController.smokingYearsChange_post)

/// Check your answers ----------------------------------------------------- ///

router.get(`/prototype_${version}/check-your-answers`, questionController.checkYourAnswers_get)
router.post(`/prototype_${version}/check-your-answers`, questionController.checkYourAnswers_post)

/// Confirmation ----------------------------------------------------------- ///

router.get(`/prototype_${version}/confirmation`, questionController.confirmation_get)

/// ------------------------------------------------------------------------ ///
/// Static pages
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/accessibility-statement`, contentController.accessibility)

router.get(`/prototype_${version}/contact-us`, contentController.contact)

router.get(`/prototype_${version}/cookies`, contentController.cookies)

router.get(`/prototype_${version}/privacy-policy`, contentController.privacy)

router.get(`/prototype_${version}/terms-of-use`, contentController.terms)

/// ------------------------------------------------------------------------ ///
/// Error pages
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/404`, errorController.pageNotFound)
router.get(`/prototype_${version}/page-not-found`, errorController.pageNotFound)

router.get(`/prototype_${version}/500`, errorController.unexpectedError)
router.get(`/prototype_${version}/server-error`, errorController.unexpectedError)

router.get(`/prototype_${version}/503`, errorController.serviceUnavailable)
router.get(`/prototype_${version}/service-unavailable`, errorController.serviceUnavailable)

/// ------------------------------------------------------------------------ ///
/// Page index
/// ------------------------------------------------------------------------ ///

router.get(`/prototype_${version}/set-default-answers`, (req, res) => {
  req.session.data = req.session.data || {}
  req.session.data.answers = getDefaultAnswerProfile(req.query.profile)

  res.redirect(getIndexRedirect(req.query.returnUrl, prototypePath))
})

router.get(`/prototype_${version}/page-index`, (req, res) => {
  res.render(view('index'), {
    actions: {
      setDefaultAnswers: `/prototype_${version}/set-default-answers`
    }
  })
})

router.get(`/prototype_${version}/index`, (req, res) => {
  res.redirect(`/prototype_${version}/page-index`)
})

router.get(`/prototype_${version}/index-allpages`, (req, res) => {
  res.redirect(`/prototype_${version}/page-index`)
})

/// ------------------------------------------------------------------------ ///
/// Add your routes above
/// ------------------------------------------------------------------------ ///

router.get(new RegExp(`^\\/prototype_${version}\\/(.+)$`), (req, res, next) => {
  const template = req.params[0]

  if (!hasView(template)) {
    return errorController.pageNotFound(req, res)
  }

  res.render(view(template))
})

module.exports = router
