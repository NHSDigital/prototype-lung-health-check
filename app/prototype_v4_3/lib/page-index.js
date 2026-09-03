const defaultAnswers = {
  acceptTerms: ['yes'],
  phoneQuestionnaire: 'no',
  smoker: 'yes_current',
  dateOfBirth: {
    day: '15',
    month: '3',
    year: '1964'
  },
  faceToFaceAppointment: 'no',
  height: {
    metric: '170'
  },
  weight: {
    metric: '70'
  },
  gender: 'female',
  sex: 'female',
  ethnicity: 'white',
  education: 'further_education',
  respiratoryConditions: ['no'],
  asbestosAtWork: 'no',
  asbestosAtHome: 'no',
  cancerDiagnosis: 'no',
  cancerDiagnosisRelatives: 'yes',
  cancerDiagnosisRelativesAge: 'no',
  smokingType: ['cigarettes'],
  cigarettes: {
    smokingStatus: 'yes',
    ageStartedSmoking: '18',
    periodsStoppedSmoking: 'no',
    smokingFrequency: 'daily',
    smokingQuantity: '10',
    smokingChange: ['greater'],
    smokingChangeIncrease: {
      frequency: 'weekly',
      quantity: '5',
      years: '10'
    }
  }
}

const cloneAnswers = () => JSON.parse(JSON.stringify(defaultAnswers))

const applyLowRiskProfile = (answers) => {
  answers.smoker = 'yes_current'
  answers.dateOfBirth = { day: '15', month: '3', year: '1970' }
  answers.height = { metric: '170' }
  answers.weight = { metric: '70' }
  answers.gender = 'female'
  answers.sex = 'female'
  answers.ethnicity = 'white'
  answers.education = 'postgraduate_degree'
  answers.respiratoryConditions = ['no']
  answers.asbestosAtWork = 'no'
  answers.asbestosAtHome = 'no'
  answers.cancerDiagnosis = 'no'
  answers.cancerDiagnosisRelatives = 'no'
  delete answers.cancerDiagnosisRelativesAge
  answers.smokingType = ['cigarettes']
  delete answers.smokingStatusCurrent
  answers.cigarettes = {
    smokingStatus: 'yes',
    ageStartedSmoking: '50',
    periodsStoppedSmoking: 'no',
    smokingFrequency: 'daily',
    smokingQuantity: '2',
    smokingChange: ['no']
  }
}

const applyHighRiskProfile = (answers) => {
  answers.smoker = 'yes_current'
  answers.dateOfBirth = { day: '15', month: '3', year: '1956' }
  answers.height = { metric: '165' }
  answers.weight = { metric: '90' }
  answers.gender = 'male'
  answers.sex = 'male'
  answers.ethnicity = 'black_african_caribbean_or_black_british'
  answers.education = 'before_15'
  answers.respiratoryConditions = [
    'bronchitis',
    'chronic_obstructive_pulmonary_disease',
    'emphysema',
    'pneumonia',
    'tuberculosis'
  ]
  answers.asbestosAtWork = 'yes'
  answers.asbestosAtHome = 'yes'
  answers.cancerDiagnosis = 'yes'
  answers.cancerDiagnosisRelatives = 'yes'
  answers.cancerDiagnosisRelativesAge = 'yes'
  answers.smokingType = ['cigarettes']
  delete answers.smokingStatusCurrent
  answers.cigarettes = {
    smokingStatus: 'yes',
    ageStartedSmoking: '16',
    periodsStoppedSmoking: 'no',
    smokingFrequency: 'daily',
    smokingQuantity: '35',
    smokingChange: ['no']
  }
}

const getDefaultAnswerProfile = (profile) => {
  const answers = cloneAnswers()

  if (profile === 'former') {
    answers.smoker = 'yes_previous'
    answers.cigarettes = {
      smokingStatus: 'no',
      ageStartedSmoking: '18',
      ageStoppedSmoking: '55',
      periodsStoppedSmoking: 'no',
      smokingFrequency: 'daily',
      smokingQuantity: '10',
      smokingChange: ['greater'],
      smokingChangeIncrease: {
        frequency: 'weekly',
        quantity: '5',
        years: '10'
      }
    }
  }

  if (profile === 'shisha') {
    answers.smokingType = ['shisha']
    delete answers.cigarettes
    answers.shisha = {
      smokingStatus: 'yes',
      ageStartedSmoking: '18',
      periodsStoppedSmoking: 'no',
      smokingFrequency: 'weekly',
      smokingQuantity: '30_minutes_to_1_hour'
    }
  }

  if (profile === 'multi') {
    answers.smokingType = ['cigarettes', 'shisha']
    answers.smokingStatusCurrent = ['cigarettes']
    answers.cigarettes = {
      ageStartedSmoking: '18',
      periodsStoppedSmoking: 'no',
      smokingFrequency: 'daily',
      smokingQuantity: '10',
      smokingChange: ['greater'],
      smokingChangeIncrease: {
        frequency: 'weekly',
        quantity: '5',
        years: '10'
      }
    }
    answers.shisha = {
      ageStartedSmoking: '25',
      ageStoppedSmoking: '50',
      periodsStoppedSmoking: 'no',
      smokingFrequency: 'monthly',
      smokingQuantity: '30_minutes_to_1_hour'
    }
  }

  if (profile === 'risk-low') {
    applyLowRiskProfile(answers)
  }

  if (profile === 'risk-high') {
    applyHighRiskProfile(answers)
  }

  return answers
}

const getIndexRedirect = (returnUrl, prototypePath) => {
  if (!returnUrl || typeof returnUrl !== 'string') {
    return `${prototypePath}/check-your-answers`
  }

  if (!returnUrl.startsWith(`${prototypePath}/`) || returnUrl.includes('//')) {
    return `${prototypePath}/page-index`
  }

  return returnUrl
}

module.exports = {
  getDefaultAnswerProfile,
  getIndexRedirect
}
