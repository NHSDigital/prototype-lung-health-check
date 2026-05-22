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
