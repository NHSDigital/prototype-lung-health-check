const version = 'v4'

const view = (template) => {
  return `prototype_${version}/views/${template}`
}

const getHeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.height?.imperial ? '/prototype_v4/height-imperial' : '/prototype_v4/height-metric'
}

const getWeightBack = (req) => {
  const { answers } = req.session.data

  return answers?.weight?.imperial ? '/prototype_v4/weight-imperial' : '/prototype_v4/weight-metric'
}

const getWeightNext = (req, defaultUnit) => {
  const { answers } = req.session.data

  if (answers?.weight?.imperial) {
    return '/prototype_v4/weight-imperial'
  }

  if (answers?.weight?.metric) {
    return '/prototype_v4/weight-metric'
  }

  return `/prototype_${version}/weight-${defaultUnit}`
}

const getDateOfBirth = (answers) => {
  const day = Number(answers?.dateOfBirth?.day)
  const month = Number(answers?.dateOfBirth?.month)
  const year = Number(answers?.dateOfBirth?.year)

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false
  }

  return date
}

const getAge = (dateOfBirth) => {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

const isEligibleForScanAge = (dateOfBirth) => {
  const age = getAge(dateOfBirth)

  return age >= 55 && age <= 74
}

/// ------------------------------------------------------------------------ ///
///
/// ------------------------------------------------------------------------ ///

exports.acceptTerms_get = (req, res) => {

  res.render(view('questions/accept-terms'), {
    actions: {
      next: '/prototype_v4/accept-terms',
      cancel: '/prototype_v4'
    }
  })
}

exports.acceptTerms_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/accept-terms'), {
      errors,
      actions: {
        next: '/prototype_v4/accept-terms',
        cancel: '/prototype_v4'
      }
    })
  } else {
    res.redirect('/prototype_v4/phone-questionnaire')
  }
}

exports.phoneQuestionnaire_get = (req, res) => {

  res.render(view('questions/phone-questionnaire'), {
    actions: {
      next: '/prototype_v4/phone-questionnaire',
      cancel: '/prototype_v4/'
    }
  })
}

exports.phoneQuestionnaire_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/phone-questionnaire'), {
      errors,
      actions: {
        next: '/prototype_v4/phone-questionnaire',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (answers.phoneQuestionnaire === 'yes') {
      res.redirect('/prototype_v4/phone-questionnaire-exit')
    } else {
      res.redirect('/prototype_v4/smoker')
    }
  }
}

exports.phoneQuestionnaireExit_get = (req, res) => {

  res.render(view('questions/phone-questionnaire-exit'), {
    actions: {
      back: '/prototype_v4/phone-questionnaire'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// Eligibility
/// ------------------------------------------------------------------------ ///

exports.smoker_get = (req, res) => {

  res.render(view('questions/smoker'), {
    actions: {
      next: '/prototype_v4/smoker',
      back: '/prototype_v4/phone-questionnaire',
      cancel: '/prototype_v4/'
    }
  })
}

exports.smoker_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/smoker'), {
      errors,
      actions: {
        next: '/prototype_v4/smoker',
        back: '/prototype_v4/phone-questionnaire',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (answers.smoker === 'no') {
      res.redirect('/prototype_v4/not-eligible-for-screening')
    } else {
      res.redirect('/prototype_v4/date-of-birth')
    }
  }
}

exports.dateOfBirth_get = (req, res) => {

  res.render(view('questions/date-of-birth'), {
    actions: {
      next: '/prototype_v4/date-of-birth',
      back: '/prototype_v4/smoker',
      cancel: '/prototype_v4/'
    }
  })
}

exports.dateOfBirth_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []
  const dateOfBirth = getDateOfBirth(answers)

  if (!dateOfBirth) {
    errors.push({
      text: 'Enter a real date of birth',
      href: '#dateOfBirth-day'
    })
  }

  if (errors.length) {
    res.render(view('questions/date-of-birth'), {
      errors,
      actions: {
        next: '/prototype_v4/date-of-birth',
        back: '/prototype_v4/smoker',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (!isEligibleForScanAge(dateOfBirth)) {
      res.redirect('/prototype_v4/not-eligible-for-scan')
    } else {
      res.redirect('/prototype_v4/face-to-face-appointment')
    }
  }
}

exports.faceToFaceAppointment_get = (req, res) => {

  res.render(view('questions/face-to-face-appointment'), {
    actions: {
      next: '/prototype_v4/face-to-face-appointment',
      back: '/prototype_v4/date-of-birth',
      cancel: '/prototype_v4/'
    }
  })
}

exports.faceToFaceAppointment_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/face-to-face-appointment'), {
      errors,
      actions: {
        next: '/prototype_v4/face-to-face-appointment',
        back: '/prototype_v4/date-of-birth',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (answers.faceToFaceAppointment === 'yes') {
      res.redirect('/prototype_v4/book-appointment')
    } else {
      res.redirect('/prototype_v4/height-metric')
    }
  }
}

exports.notEligibleForScreening_get = (req, res) => {
  res.render(view('questions/not-eligible-for-screening'), {
    actions: {
      back: '/prototype_v4/smoker',
      cancel: '/prototype_v4/'
    }
  })
}

exports.notEligibleForScan_get = (req, res) => {
  res.render(view('questions/not-eligible-for-scan'), {
    actions: {
      back: '/prototype_v4/date-of-birth',
      cancel: '/prototype_v4/'
    }
  })
}

exports.bookAppointment_get = (req, res) => {
  res.render(view('questions/book-appointment'), {
    actions: {
      back: '/prototype_v4/face-to-face-appointment',
      cancel: '/prototype_v4/'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// About you
/// ------------------------------------------------------------------------ ///

exports.heightMetric_get = (req, res) => {
  res.render(view('questions/height-metric'), {
    actions: {
      next: '/prototype_v4/height-metric',
      switchUnits: '/prototype_v4/height-imperial',
      back: '/prototype_v4/face-to-face-appointment',
      cancel: '/prototype_v4/'
    }
  })
}

exports.heightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/height-metric'), {
      errors,
      actions: {
        next: '/prototype_v4/height-metric',
        switchUnits: '/prototype_v4/height-imperial',
        back: '/prototype_v4/face-to-face-appointment',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    delete answers.height?.imperial
    res.redirect(getWeightNext(req, 'metric'))
  }
}

exports.heightImperial_get = (req, res) => {
  res.render(view('questions/height-imperial'), {
    actions: {
      next: '/prototype_v4/height-imperial',
      switchUnits: '/prototype_v4/height-metric',
      back: '/prototype_v4/face-to-face-appointment',
      cancel: '/prototype_v4/'
    }
  })
}

exports.heightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/height-imperial'), {
      errors,
      actions: {
        next: '/prototype_v4/height-imperial',
        switchUnits: '/prototype_v4/height-metric',
        back: '/prototype_v4/face-to-face-appointment',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    delete answers.height?.metric
    res.redirect(getWeightNext(req, 'imperial'))
  }
}

exports.weightMetric_get = (req, res) => {
  const back = getHeightBack(req)

  res.render(view('questions/weight-metric'), {
    actions: {
      next: '/prototype_v4/weight-metric',
      switchUnits: '/prototype_v4/weight-imperial',
      back,
      cancel: '/prototype_v4/'
    }
  })
}

exports.weightMetric_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight-metric'), {
      errors,
      actions: {
        next: '/prototype_v4/weight-metric',
        switchUnits: '/prototype_v4/weight-imperial',
        back,
        cancel: '/prototype_v4/'
      }
    })
  } else {
    delete answers.weight?.imperial
    res.redirect('/prototype_v4/gender')
  }
}

exports.weightImperial_get = (req, res) => {
  const back = getHeightBack(req)

  res.render(view('questions/weight-imperial'), {
    actions: {
      next: '/prototype_v4/weight-imperial',
      switchUnits: '/prototype_v4/weight-metric',
      back,
      cancel: '/prototype_v4/'
    }
  })
}

exports.weightImperial_post = (req, res) => {
  const { answers } = req.session.data
  const back = getHeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight-imperial'), {
      errors,
      actions: {
        next: '/prototype_v4/weight-imperial',
        switchUnits: '/prototype_v4/weight-metric',
        back,
        cancel: '/prototype_v4/'
      }
    })
  } else {
    delete answers.weight?.metric
    res.redirect('/prototype_v4/gender')
  }
}

exports.gender_get = (req, res) => {
  const back = getWeightBack(req)

  res.render(view('questions/gender'), {
    actions: {
      next: '/prototype_v4/gender',
      back,
      cancel: '/prototype_v4/'
    }
  })
}

exports.gender_post = (req, res) => {
  const back = getWeightBack(req)
  const errors = []

  if (errors.length) {
    res.render(view('questions/gender'), {
      errors,
      actions: {
        next: '/prototype_v4/gender',
        back,
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/sex')
  }
}

exports.sex_get = (req, res) => {
  res.render(view('questions/sex'), {
    actions: {
      next: '/prototype_v4/sex',
      back: '/prototype_v4/gender',
      cancel: '/prototype_v4/'
    }
  })
}

exports.sex_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/sex'), {
      errors,
      actions: {
        next: '/prototype_v4/sex',
        back: '/prototype_v4/gender',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/ethnicity')
  }
}

exports.ethnicity_get = (req, res) => {

  res.render(view('questions/ethnicity'), {
    actions: {
      next: '/prototype_v4/ethnicity',
      back: '/prototype_v4/gender',
      cancel: '/prototype_v4/'
    }
  })
}

exports.ethnicity_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/ethnicity'), {
      errors,
      actions: {
        next: '/prototype_v4/ehtnicity',
        back: '/prototype_v4/gender',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/education')
  }
}

exports.education_get = (req, res) => {

  res.render(view('questions/education'), {
    actions: {
      next: '/prototype_v4/education',
      back: '/prototype_v4/ethnicity',
      cancel: '/prototype_v4/'
    }
  })
}

exports.education_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/education'), {
      errors,
      actions: {
        next: '/prototype_v4/education',
        back: '/prototype_v4/ethnicity',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/respiratory-conditions')
  }
}

/// ------------------------------------------------------------------------ ///
/// Your health
/// ------------------------------------------------------------------------ ///

exports.respiratoryConditions_get = (req, res) => {

  res.render(view('questions/respiratory-conditions'), {
    actions: {
      next: '/prototype_v4/respiratory-conditions',
      back: '/prototype_v4/education',
      cancel: '/prototype_v4/'
    }
  })
}

exports.respiratoryConditions_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/respiratory-conditions'), {
      errors,
      actions: {
        next: '/prototype_v4/respiratory-conditions',
        back: '/prototype_v4/education',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/asbestos-at-work')
  }
}

exports.asbestosAtWork_get = (req, res) => {

  res.render(view('questions/asbestos-at-work'), {
    actions: {
      next: '/prototype_v4/asbestos-at-work',
      back: '/prototype_v4/respiratory-conditions',
      cancel: '/prototype_v4/'
    }
  })
}

exports.asbestosAtWork_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/asbestos-at-work'), {
      errors,
      actions: {
        next: '/prototype_v4/asbestos-at-work',
        back: '/prototype_v4/respiratory-conditions',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/asbestos-at-home')
  }
}

exports.asbestosAtHome_get = (req, res) => {

  res.render(view('questions/asbestos-at-home'), {
    actions: {
      next: '/prototype_v4/asbestos-at-home',
      back: '/prototype_v4/asbestos-at-work',
      cancel: '/prototype_v4/'
    }
  })
}

exports.asbestosAtHome_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/asbestos-at-home'), {
      errors,
      actions: {
        next: '/prototype_v4/asbestos-at-home',
        back: '/prototype_v4/asbestos-at-work',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/cancer-diagnosis')
  }
}

exports.cancerDiagnosis_get = (req, res) => {

  res.render(view('questions/cancer-diagnosis'), {
    actions: {
      next: '/prototype_v4/cancer-diagnosis',
      back: '/prototype_v4/asbestos-at-work',
      cancel: '/prototype_v4/'
    }
  })
}

exports.cancerDiagnosis_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis'), {
      errors,
      actions: {
        next: '/prototype_v4/cancer-diagnosis',
        back: '/prototype_v4/asbestos-at-work',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/cancer-diagnosis-relatives')
  }
}

/// ------------------------------------------------------------------------ ///
/// Family history
/// ------------------------------------------------------------------------ ///

exports.cancerDiagnosisRelatives_get = (req, res) => {

  res.render(view('questions/cancer-diagnosis-relatives'), {
    actions: {
      next: '/prototype_v4/cancer-diagnosis-relatives',
      back: '/prototype_v4/cancer-diagnosis',
      cancel: '/prototype_v4/'
    }
  })
}

exports.cancerDiagnosisRelatives_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis-relatives'), {
      errors,
      actions: {
        next: '/prototype_v4/cancer-diagnosis-relatives',
        back: '/prototype_v4/cancer-diagnosis',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (answers.cancerDiagnosisRelatives === 'yes') {
      res.redirect('/prototype_v4/cancer-diagnosis-relatives-age')
    } else {
      delete answers.cancerDiagnosisRelativesAge
      res.redirect('/prototype_v4/age-started-smoking')
    }
  }
}

exports.cancerDiagnosisRelativesAge_get = (req, res) => {

  res.render(view('questions/cancer-diagnosis-relatives-age'), {
    actions: {
      next: '/prototype_v4/cancer-diagnosis-relatives-age',
      back: '/prototype_v4/cancer-diagnosis-relatives',
      cancel: '/prototype_v4/'
    }
  })
}

exports.cancerDiagnosisRelativesAge_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/cancer-diagnosis-relatives-age'), {
      errors,
      actions: {
        next: '/prototype_v4/cancer-diagnosis-relatives-age',
        back: '/prototype_v4/cancer-diagnosis-relatives',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/age-started-smoking')
  }
}

/// ------------------------------------------------------------------------ ///
/// Smoking habits
/// ------------------------------------------------------------------------ ///

exports.ageStartedSmoking_get = (req, res) => {
  const { answers } = req.session.data
  const back = answers?.cancerDiagnosisRelativesAge ? '/prototype_v4/cancer-diagnosis-relatives-age' : '/prototype_v4/cancer-diagnosis-relatives'

  res.render(view('questions/age-started-smoking'), {
    actions: {
      next: '/prototype_v4/age-started-smoking',
      back,
      cancel: '/prototype_v4/'
    }
  })
}

exports.ageStartedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const back = answers?.cancerDiagnosisRelativesAge ? '/prototype_v4/cancer-diagnosis-relatives-age' : '/prototype_v4/cancer-diagnosis-relatives'

  const errors = []

  // TODO:
  // If not answered, throw error
  // If the age started smoking is older than person's age
  // based on date of birth, throw error

  if (errors.length) {
    res.render(view('questions/age-started-smoking'), {
      errors,
      actions: {
        next: '/prototype_v4/age-started-smoking',
        back,
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/periods-stopped-smoking')
  }
}

exports.periodsStoppedSmoking_get = (req, res) => {
  res.render(view('questions/periods-stopped-smoking'), {
    actions: {
      next: '/prototype_v4/periods-stopped-smoking',
      back: '/prototype_v4/age-started-smoking',
      cancel: '/prototype_v4/'
    }
  })
}

exports.periodsStoppedSmoking_post = (req, res) => {
  const { answers } = req.session.data
  const errors = []

  if (errors.length) {
    res.render(view('questions/periods-stopped-smoking'), {
      errors,
      actions: {
        next: '/prototype_v4/periods-stopped-smoking',
        back: '/prototype_v4/age-started-smoking',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    if (answers.periodsStoppedSmoking === 'no') {
      delete answers.yearsStoppedSmoking
    }
    res.redirect('/prototype_v4/type-of-smoking')
  }
}

/// ------------------------------------------------------------------------ ///
/// Tobacco
/// ------------------------------------------------------------------------ ///

/// Tobacco A -------------------------------------------------------------- ///

/// Tobacco B -------------------------------------------------------------- ///

/// Tobacco C -------------------------------------------------------------- ///

/// Tobacco D -------------------------------------------------------------- ///

exports.XYZ_get = (req, res) => {

  res.render(view('questions/xyz'), {
    actions: {
      next: '/prototype_v4/',
      back: '/prototype_v4/',
      cancel: '/prototype_v4/'
    }
  })
}

exports.XYZ_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/xyz'), {
      errors,
      actions: {
        next: '/prototype_v4/',
        back: '/prototype_v4/',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/')
  }
}
