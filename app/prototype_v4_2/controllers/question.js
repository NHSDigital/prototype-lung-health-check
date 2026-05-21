const { getDateOfBirth, isEligibleForScanAge } = require('../lib/eligibility')
const { getQuestionPage } = require('../lib/question-pages')
const { renderQuestion, renderQuestionPage, version, view } = require('../lib/question-renderer')
const { getCheckYourAnswers } = require('../lib/summary')
const {
  deleteUnselectedSmokingQuantityOtherAnswer,
  deleteUnselectedSmokingChangeAnswers,
  deleteUnselectedSmokingTypeAnswers,
  getFormerSmokerFallbackStep,
  getSelectedSmokingTypes,
  getSmokingTypeActions,
  getSmokingTypeQuestionOverrides,
  getSmokingTypeStep,
  getSmokingTypeSteps,
  getSmokingTypeStepUrl,
  renderSmokingTypePage,
  renderSmokingTypeQuestion,
  validateSmokingTypePage,
  validateSmokingTypeQuestion
} = require('../lib/tobacco-flow')
const { getHeightBack, getWeightBack, getWeightNext } = require('../lib/unit-navigation')
const { validateQuestion, validateQuestions } = require('../lib/question-validator')

const getQuestionPageIds = (id, answers = {}) => {
  return getQuestionPage(id, answers).questions.map((question) => question.id)
}

/// ------------------------------------------------------------------------ ///
///
/// ------------------------------------------------------------------------ ///

exports.acceptTerms_get = (req, res) => {
  renderQuestion(res, 'accept-terms', {
    next: `/prototype_${version}/accept-terms`,
    back: `/prototype_${version}/sign-in-agreement`,
    cancel: `/prototype_${version}`
  })
}

exports.acceptTerms_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'accept-terms')

  if (errors.length) {
    renderQuestion(res, 'accept-terms', {
      next: `/prototype_${version}/accept-terms`,
      back: `/prototype_${version}/sign-in-agreement`,
      cancel: `/prototype_${version}`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/phone-questionnaire`)
  }
}

exports.phoneQuestionnaire_get = (req, res) => {
  renderQuestion(res, 'phone-questionnaire', {
    next: `/prototype_${version}/phone-questionnaire`,
    back: `/prototype_${version}/accept-terms`,
    cancel: `/prototype_${version}/`
  })
}

exports.phoneQuestionnaire_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'phone-questionnaire')

  if (errors.length) {
    renderQuestion(res, 'phone-questionnaire', {
      next: `/prototype_${version}/phone-questionnaire`,
      back: `/prototype_${version}/accept-terms`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.phoneQuestionnaire === 'yes') {
      res.redirect(`/prototype_${version}/phone-questionnaire-exit`)
    } else {
      res.redirect(`/prototype_${version}/smoker`)
    }
  }
}

exports.phoneQuestionnaireExit_get = (req, res) => {
  res.render(view('questions/phone-questionnaire-exit'), {
    actions: {
      back: `/prototype_${version}/phone-questionnaire`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// Eligibility
/// ------------------------------------------------------------------------ ///

exports.smoker_get = (req, res) => {
  renderQuestion(res, 'smoker', {
    next: `/prototype_${version}/smoker`,
    back: `/prototype_${version}/phone-questionnaire`,
    cancel: `/prototype_${version}/`
  })
}

exports.smoker_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'smoker')

  if (errors.length) {
    renderQuestion(res, 'smoker', {
      next: `/prototype_${version}/smoker`,
      back: `/prototype_${version}/phone-questionnaire`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (['no', 'yes_fewer_than_100'].includes(answers.smoker)) {
      res.redirect(`/prototype_${version}/not-eligible-for-screening`)
    } else {
      res.redirect(`/prototype_${version}/date-of-birth`)
    }
  }
}

exports.dateOfBirth_get = (req, res) => {
  renderQuestion(res, 'date-of-birth', {
    next: `/prototype_${version}/date-of-birth`,
    back: `/prototype_${version}/smoker`,
    cancel: `/prototype_${version}/`
  })
}

exports.dateOfBirth_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'date-of-birth')
  const dateOfBirth = getDateOfBirth(answers)

  if (errors.length) {
    renderQuestion(res, 'date-of-birth', {
      next: `/prototype_${version}/date-of-birth`,
      back: `/prototype_${version}/smoker`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (!isEligibleForScanAge(dateOfBirth)) {
      res.redirect(`/prototype_${version}/not-eligible-for-scan`)
    } else {
      res.redirect(`/prototype_${version}/face-to-face-appointment`)
    }
  }
}

exports.faceToFaceAppointment_get = (req, res) => {
  renderQuestion(res, 'face-to-face-appointment', {
    next: `/prototype_${version}/face-to-face-appointment`,
    back: `/prototype_${version}/date-of-birth`,
    cancel: `/prototype_${version}/`
  })
}

exports.faceToFaceAppointment_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'face-to-face-appointment')

  if (errors.length) {
    renderQuestion(res, 'face-to-face-appointment', {
      next: `/prototype_${version}/face-to-face-appointment`,
      back: `/prototype_${version}/date-of-birth`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.faceToFaceAppointment === 'yes') {
      res.redirect(`/prototype_${version}/book-appointment`)
    } else {
      res.redirect(`/prototype_${version}/height-metric`)
    }
  }
}

exports.notEligibleForScreening_get = (req, res) => {
  res.render(view('questions/not-eligible-for-screening'), {
    actions: {
      back: `/prototype_${version}/smoker`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.notEligibleForScan_get = (req, res) => {
  res.render(view('questions/not-eligible-for-scan'), {
    actions: {
      back: `/prototype_${version}/date-of-birth`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.bookAppointment_get = (req, res) => {
  res.render(view('questions/book-appointment'), {
    actions: {
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// About you
/// ------------------------------------------------------------------------ ///

exports.heightMetric_get = (req, res) => {
  renderQuestion(res, 'height-metric', {
    next: `/prototype_${version}/height-metric`,
    switchUnits: `/prototype_${version}/height-imperial`,
    back: `/prototype_${version}/face-to-face-appointment`,
    cancel: `/prototype_${version}/`
  })
}

exports.heightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'height-metric')

  if (errors.length) {
    renderQuestion(res, 'height-metric', {
      next: `/prototype_${version}/height-metric`,
      switchUnits: `/prototype_${version}/height-imperial`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.height?.imperial
    res.redirect(getWeightNext(req, 'metric'))
  }
}

exports.heightImperial_get = (req, res) => {
  renderQuestion(res, 'height-imperial', {
    next: `/prototype_${version}/height-imperial`,
    switchUnits: `/prototype_${version}/height-metric`,
    back: `/prototype_${version}/face-to-face-appointment`,
    cancel: `/prototype_${version}/`
  })
}

exports.heightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'height-imperial')

  if (errors.length) {
    renderQuestion(res, 'height-imperial', {
      next: `/prototype_${version}/height-imperial`,
      switchUnits: `/prototype_${version}/height-metric`,
      back: `/prototype_${version}/face-to-face-appointment`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.height?.metric
    res.redirect(getWeightNext(req, 'imperial'))
  }
}

exports.weightMetric_get = (req, res) => {
  const back = getHeightBack(req)

  renderQuestion(res, 'weight-metric', {
    next: `/prototype_${version}/weight-metric`,
    switchUnits: `/prototype_${version}/weight-imperial`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.weightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = validateQuestion(answers, 'weight-metric')

  if (errors.length) {
    renderQuestion(res, 'weight-metric', {
      next: `/prototype_${version}/weight-metric`,
      switchUnits: `/prototype_${version}/weight-imperial`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.weight?.imperial
    res.redirect(`/prototype_${version}/about-you`)
  }
}

exports.weightImperial_get = (req, res) => {
  const back = getHeightBack(req)

  renderQuestion(res, 'weight-imperial', {
    next: `/prototype_${version}/weight-imperial`,
    switchUnits: `/prototype_${version}/weight-metric`,
    back,
    cancel: `/prototype_${version}/`
  })
}

exports.weightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = validateQuestion(answers, 'weight-imperial')

  if (errors.length) {
    renderQuestion(res, 'weight-imperial', {
      next: `/prototype_${version}/weight-imperial`,
      switchUnits: `/prototype_${version}/weight-metric`,
      back,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    delete answers.weight?.metric
    res.redirect(`/prototype_${version}/about-you`)
  }
}

exports.aboutYou_get = (req, res) => {
  const back = getWeightBack(req)
  const { answers } = req.session.data

  renderQuestionPage(res, 'about-you', {
    next: `/prototype_${version}/about-you`,
    back,
    cancel: `/prototype_${version}/`
  }, [], answers)
}

exports.aboutYou_post = (req, res) => {
  const { answers } = req.session.data
  const back = getWeightBack(req)
  const errors = validateQuestions(answers, getQuestionPageIds('about-you', answers))

  if (errors.length) {
    renderQuestionPage(res, 'about-you', {
      next: `/prototype_${version}/about-you`,
      back,
      cancel: `/prototype_${version}/`
    }, errors, answers)
  } else {
    res.redirect(`/prototype_${version}/respiratory-conditions`)
  }
}

// exports.gender_get = (req, res) => {
//   const back = getWeightBack(req)

//   renderQuestion(res, 'gender', {
//     next: `/prototype_${version}/gender`,
//     back,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.gender_post = (req, res) => {
//   const { answers } = req.session.data
//   const back = getWeightBack(req)
//   const errors = validateQuestion(answers, 'gender')

//   if (errors.length) {
//     renderQuestion(res, 'gender', {
//       next: `/prototype_${version}/gender`,
//       back,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/sex`)
//   }
// }

// exports.sex_get = (req, res) => {
//   renderQuestion(res, 'sex', {
//     next: `/prototype_${version}/sex`,
//     back: `/prototype_${version}/gender`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.sex_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestion(answers, 'sex')

//   if (errors.length) {
//     renderQuestion(res, 'sex', {
//       next: `/prototype_${version}/sex`,
//       back: `/prototype_${version}/gender`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/ethnicity`)
//   }
// }

// exports.ethnicity_get = (req, res) => {
//   renderQuestion(res, 'ethnicity', {
//     next: `/prototype_${version}/ethnicity`,
//     back: `/prototype_${version}/sex`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.ethnicity_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestion(answers, 'ethnicity')

//   if (errors.length) {
//     renderQuestion(res, 'ethnicity', {
//       next: `/prototype_${version}/ethnicity`,
//       back: `/prototype_${version}/sex`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/education`)
//   }
// }

// exports.education_get = (req, res) => {
//   renderQuestion(res, 'education', {
//     next: `/prototype_${version}/education`,
//     back: `/prototype_${version}/ethnicity`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.education_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestion(answers, 'education')

//   if (errors.length) {
//     renderQuestion(res, 'education', {
//       next: `/prototype_${version}/education`,
//       back: `/prototype_${version}/ethnicity`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/respiratory-conditions`)
//   }
// }

/// ------------------------------------------------------------------------ ///
/// Your health
/// ------------------------------------------------------------------------ ///

exports.respiratoryConditions_get = (req, res) => {
  renderQuestion(res, 'respiratory-conditions', {
    next: `/prototype_${version}/respiratory-conditions`,
    back: `/prototype_${version}/about-you`,
    cancel: `/prototype_${version}/`
  })
}

exports.respiratoryConditions_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'respiratory-conditions')

  if (errors.length) {
    renderQuestion(res, 'respiratory-conditions', {
      next: `/prototype_${version}/respiratory-conditions`,
      back: `/prototype_${version}/about-you`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/asbestos`)
  }
}

exports.asbestos_get = (req, res) => {
  const { answers } = req.session.data

  renderQuestionPage(res, 'asbestos', {
    next: `/prototype_${version}/asbestos`,
    back: `/prototype_${version}/respiratory-conditions`,
    cancel: `/prototype_${version}/`
  }, [], answers)
}

exports.asbestos_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestions(answers, getQuestionPageIds('asbestos', answers))

  if (errors.length) {
    renderQuestionPage(res, 'asbestos', {
      next: `/prototype_${version}/asbestos`,
      back: `/prototype_${version}/respiratory-conditions`,
      cancel: `/prototype_${version}/`
    }, errors, answers)
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis`)
  }
}

// exports.asbestosAtWork_get = (req, res) => {
//   renderQuestion(res, 'asbestos-at-work', {
//     next: `/prototype_${version}/asbestos-at-work`,
//     back: `/prototype_${version}/respiratory-conditions`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.asbestosAtWork_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestion(answers, 'asbestos-at-work')

//   if (errors.length) {
//     renderQuestion(res, 'asbestos-at-work', {
//       next: `/prototype_${version}/asbestos-at-work`,
//       back: `/prototype_${version}/respiratory-conditions`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/asbestos-at-home`)
//   }
// }

// exports.asbestosAtHome_get = (req, res) => {
//   renderQuestion(res, 'asbestos-at-home', {
//     next: `/prototype_${version}/asbestos-at-home`,
//     back: `/prototype_${version}/asbestos-at-work`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.asbestosAtHome_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestion(answers, 'asbestos-at-home')

//   if (errors.length) {
//     renderQuestion(res, 'asbestos-at-home', {
//       next: `/prototype_${version}/asbestos-at-home`,
//       back: `/prototype_${version}/asbestos-at-work`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     res.redirect(`/prototype_${version}/cancer-diagnosis`)
//   }
// }

// exports.cancerHistory_get = (req, res) => {
//   renderQuestionPage(res, 'cancer-history', {
//     next: `/prototype_${version}/cancer-history`,
//     back: `/prototype_${version}/asbestos`,
//     cancel: `/prototype_${version}/`
//   })
// }

// exports.cancerHistory_post = (req, res) => {
//   const { answers } = req.session.data
//   const errors = validateQuestions(answers, getQuestionPageIds('cancer-history'))

//   if (errors.length) {
//     renderQuestionPage(res, 'cancer-history', {
//       next: `/prototype_${version}/cancer-history`,
//       back: `/prototype_${version}/asbestos`,
//       cancel: `/prototype_${version}/`
//     }, errors)
//   } else {
//     if (answers.cancerDiagnosisRelatives === 'yes') {
//       res.redirect(`/prototype_${version}/cancer-diagnosis-relatives-age`)
//     } else {
//       delete answers.cancerDiagnosisRelativesAge
//       res.redirect(`/prototype_${version}/smoking-duration`)
//     }
//   }
// }

exports.cancerDiagnosis_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis', {
    next: `/prototype_${version}/cancer-diagnosis`,
    back: `/prototype_${version}/asbestos`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosis_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis', {
      next: `/prototype_${version}/cancer-diagnosis`,
      back: `/prototype_${version}/asbestos`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/cancer-diagnosis-relatives`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Family history
/// ------------------------------------------------------------------------ ///

exports.cancerDiagnosisRelatives_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis-relatives', {
    next: `/prototype_${version}/cancer-diagnosis-relatives`,
    back: `/prototype_${version}/cancer-diagnosis`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosisRelatives_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis-relatives')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis-relatives', {
      next: `/prototype_${version}/cancer-diagnosis-relatives`,
      back: `/prototype_${version}/cancer-diagnosis`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    if (answers.cancerDiagnosisRelatives === 'yes') {
      res.redirect(`/prototype_${version}/cancer-diagnosis-relatives-age`)
    } else {
      delete answers.cancerDiagnosisRelativesAge
      res.redirect(`/prototype_${version}/smoking-duration`)
    }
  }
}

exports.cancerDiagnosisRelativesAge_get = (req, res) => {
  renderQuestion(res, 'cancer-diagnosis-relatives-age', {
    next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
    back: `/prototype_${version}/cancer-diagnosis-relatives`,
    cancel: `/prototype_${version}/`
  })
}

exports.cancerDiagnosisRelativesAge_post = (req, res) => {
  const { answers } = req.session.data
  const errors = validateQuestion(answers, 'cancer-diagnosis-relatives-age')

  if (errors.length) {
    renderQuestion(res, 'cancer-diagnosis-relatives-age', {
      next: `/prototype_${version}/cancer-diagnosis-relatives-age`,
      back: `/prototype_${version}/cancer-diagnosis-relatives`,
      cancel: `/prototype_${version}/`
    }, errors)
  } else {
    res.redirect(`/prototype_${version}/smoking-duration`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Smoking habits
/// ------------------------------------------------------------------------ ///

exports.smokingDuration_get = (req, res) => {
  const answers = req.session.data.answers || {}
  const back = answers?.cancerDiagnosisRelativesAge ? `/prototype_${version}/cancer-diagnosis-relatives-age` : `/prototype_${version}/cancer-diagnosis-relatives`

  renderQuestionPage(res, 'smoking-duration', {
    next: `/prototype_${version}/smoking-duration`,
    back,
    cancel: `/prototype_${version}/`
  }, [], answers)
}

exports.smokingDuration_post = (req, res) => {
  const answers = req.session.data.answers || {}
  const back = answers?.cancerDiagnosisRelativesAge ? `/prototype_${version}/cancer-diagnosis-relatives-age` : `/prototype_${version}/cancer-diagnosis-relatives`
  const errors = validateQuestions(answers, getQuestionPageIds('smoking-duration', answers))

  if (errors.length) {
    renderQuestionPage(res, 'smoking-duration', {
      next: `/prototype_${version}/smoking-duration`,
      back,
      cancel: `/prototype_${version}/`
    }, errors, answers)
  } else {
    if (!getQuestionPageIds('smoking-duration', answers).includes('age-stopped-smoking')) {
      delete answers.ageStoppedSmoking
    }

    if (answers.periodsStoppedSmoking === 'no') {
      delete answers.yearsStoppedSmoking
    }

    res.redirect(`/prototype_${version}/smoking-type`)
  }
}

/// ------------------------------------------------------------------------ ///
/// Tobacco
/// ------------------------------------------------------------------------ ///

exports.smokingType_get = (req, res) => {
  const answers = req.session.data.answers || {}

  renderQuestion(res, 'smoking-type', {
    next: `/prototype_${version}/smoking-type`,
    back: `/prototype_${version}/smoking-duration`,
    cancel: `/prototype_${version}/`
  }, [], getSmokingTypeQuestionOverrides(answers))
}

exports.smokingType_post = (req, res) => {
  const answers = req.session.data.answers || {}
  const errors = validateQuestion(answers, 'smoking-type')

  if (errors.length) {
    renderQuestion(res, 'smoking-type', {
      next: `/prototype_${version}/smoking-type`,
      back: `/prototype_${version}/smoking-duration`,
      cancel: `/prototype_${version}/`
    }, errors, getSmokingTypeQuestionOverrides(answers))
  } else {
    const selectedTypes = Array.isArray(answers.smokingType)
      ? answers.smokingType
      : [answers.smokingType].filter(Boolean)
    deleteUnselectedSmokingTypeAnswers(answers)
    if (answers.smoker === 'yes_previous') {
      getSelectedSmokingTypes(answers).forEach((type) => {
        delete answers[type]?.smokingStatus
      })
    }
    const steps = getSmokingTypeSteps(answers)

    if (selectedTypes.includes('none')) {
      res.redirect(`/prototype_${version}/smoking-type-exit`)
    } else if (steps.length) {
      res.redirect(getSmokingTypeStepUrl(steps[0]))
    } else {
      res.redirect(`/prototype_${version}/smoking-type`)
    }
  }
}

exports.tobaccoSmoking_get = (req, res) => {
  renderSmokingTypePage(req, res, 'tobacco-smoking')
}

exports.tobaccoSmoking_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'tobacco-smoking')
  const { answers } = req.session.data

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  deleteUnselectedSmokingQuantityOtherAnswer(answers, step)

  const errors = validateSmokingTypePage(req, 'tobacco-smoking', step)

  if (errors.length) {
    renderSmokingTypePage(req, res, 'tobacco-smoking', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingTypeExit_get = (req, res) => {
  res.render(view('questions/smoking-type-exit'), {
    actions: {
      back: `/prototype_${version}/smoking-type`
    }
  })
}

exports.smokingStatus_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-status')
}

exports.smokingStatus_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-status')
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-status', step) : []

  if (!step) {
    const fallbackStep = getFormerSmokerFallbackStep(req, 'smoking-status', steps)

    if (fallbackStep) {
      res.redirect(getSmokingTypeStepUrl(fallbackStep))
      return
    }

    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-status', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.smokingChange_get = (req, res) => {
  renderSmokingTypeQuestion(req, res, 'smoking-change')
}

exports.smokingChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'smoking-change')
  const { answers } = req.session.data
  const errors = step ? validateSmokingTypeQuestion(req, 'smoking-change', step) : []

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  deleteUnselectedSmokingChangeAnswers(answers[step.type])

  if (errors.length) {
    renderSmokingTypeQuestion(req, res, 'smoking-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

exports.tobaccoSmokingChange_get = (req, res) => {
  renderSmokingTypePage(req, res, 'tobacco-smoking-change')
}

exports.tobaccoSmokingChange_post = (req, res) => {
  const { step, steps } = getSmokingTypeStep(req, 'tobacco-smoking-change')

  if (!step) {
    res.redirect(`/prototype_${version}/smoking-type`)
    return
  }

  deleteUnselectedSmokingQuantityOtherAnswer(req.session.data.answers, step, 'quantity')
  const errors = validateSmokingTypePage(req, 'tobacco-smoking-change', step)

  if (errors.length) {
    renderSmokingTypePage(req, res, 'tobacco-smoking-change', errors)
  } else {
    res.redirect(getSmokingTypeActions(step, steps).onward)
  }
}

/// ------------------------------------------------------------------------ ///
/// Check your answers
/// ------------------------------------------------------------------------ ///

exports.checkYourAnswers_get = (req, res) => {
  const { answers } = req.session.data
  const smokingSteps = getSmokingTypeSteps(answers)
  const lastSmokingStep = smokingSteps[smokingSteps.length - 1]

  res.render(view('check-your-answers'), {
    checkYourAnswers: getCheckYourAnswers(answers),
    actions: {
      next: `/prototype_${version}/check-your-answers`,
      back: lastSmokingStep ? getSmokingTypeStepUrl(lastSmokingStep) : `/prototype_${version}/smoking-type`,
      cancel: `/prototype_${version}/`
    }
  })
}

exports.checkYourAnswers_post = (req, res) => {
  res.redirect(`/prototype_${version}/confirmation`)
}

/// ------------------------------------------------------------------------ ///
/// Confirmation
/// ------------------------------------------------------------------------ ///

exports.confirmation_get = (req, res) => {
  res.render(view('confirmation'))
}
