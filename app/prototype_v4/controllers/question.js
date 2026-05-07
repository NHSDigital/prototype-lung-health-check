const version = 'v4'
const view = (template) => {
  return `prototype_${version}/views/${template}`
}

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
    res.redirect('/prototype_v4/date-of-birth')
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
  const errors = []

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
    res.redirect('/prototype_v4/face-to-face-appointment')
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
    res.redirect('/prototype_v4/height-metric')
  }
}

exports.notEligibleForScreening_get = (req, res) => {

  res.render(view('questions/not-elligible-for-screening'), {
    actions: {
      cancel: '/prototype_v4/',
      back: '/prototype_v4/'
    }
  })
}

exports.notEligibleForScan_get = (req, res) => {

  res.render(view('questions/not-elligible-for-scan'), {
    actions: {
      cancel: '/prototype_v4/',
      back: '/prototype_v4/'
    }
  })
}

exports.bookAppointment_get = (req, res) => {

  res.render(view('questions/book-appointment'), {
    actions: {
      cancel: '/prototype_v4/',
      back: '/prototype_v4/'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// About you
/// ------------------------------------------------------------------------ ///

exports.heightMetric_get = (req, res) => {

  res.render(view('questions/height'), {
    actions: {
      next: '/prototype_v4/height-metric',
      back: '/prototype_v4/face-to-face-appointment',
      cancel: '/prototype_v4/'
    }
  })
}

exports.heightMetric_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/height'), {
      errors,
      actions: {
        next: '/prototype_v4/height-metric',
        back: '/prototype_v4/face-to-face-appointment',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/weight-metric')
  }
}

exports.heightImperial_get = (req, res) => {

  res.render(view('questions/height'), {
    actions: {
      next: '/prototype_v4/height-imperial',
      back: '/prototype_v4/face-to-face-appointment',
      cancel: '/prototype_v4/'
    }
  })
}

exports.heightImperial_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/height'), {
      errors,
      actions: {
        next: '/prototype_v4/height-imperial',
        back: '/prototype_v4/face-to-face-appointment',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/weight-imperial')
  }
}

exports.weightMetric_get = (req, res) => {

  res.render(view('questions/weight'), {
    actions: {
      next: '/prototype_v4/weight-metric',
      back: '/prototype_v4/height',
      cancel: '/prototype_v4/'
    }
  })
}

exports.weightMetric_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight'), {
      errors,
      actions: {
        next: '/prototype_v4/weight-metric',
        back: '/prototype_v4/height',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/gender')
  }
}

exports.weightImperial_get = (req, res) => {

  res.render(view('questions/weight'), {
    actions: {
      next: '/prototype_v4/weight-imperial',
      back: '/prototype_v4/height',
      cancel: '/prototype_v4/'
    }
  })
}

exports.weightImperial_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/weight'), {
      errors,
      actions: {
        next: '/prototype_v4/weight-imperial',
        back: '/prototype_v4/height',
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/gender')
  }
}

exports.gender_get = (req, res) => {

  res.render(view('questions/gender'), {
    actions: {
      next: '/prototype_v4/gender',
      back: '/prototype_v4/sex',
      cancel: '/prototype_v4/'
    }
  })
}

exports.gender_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('questions/gender'), {
      errors,
      actions: {
        next: '/prototype_v4/gender',
        back: '/prototype_v4/sex',
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
      back: '/prototype_v4/weight',
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
        back: '/prototype_v4/weight',
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
    res.redirect('/prototype_v4/')
  }
}

/// ------------------------------------------------------------------------ ///
/// Family history
/// ------------------------------------------------------------------------ ///

/// ------------------------------------------------------------------------ ///
/// Smoking habits
/// ------------------------------------------------------------------------ ///

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
        cancel: '/prototype_v4/'
      }
    })
  } else {
    res.redirect('/prototype_v4/')
  }
}
