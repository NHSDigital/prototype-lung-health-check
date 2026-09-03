const { toNumber } = require('./measurements')

const cigaretteEquivalentFactors = {
  cigarettes: 1,
  small_cigars: 1.5,
  medium_cigars: 2,
  large_cigars: 4,
  pipes: 2.5,
  cigarillos: 2
}

const rollingTobaccoRepresentativeGrams = {
  less_than_10: 5,
  '10_to_30': 20,
  '31_to_50': 40.5,
  '51_to_75': 63,
  '76_to_100': 88,
  more_than_100: 100
}

const shishaRepresentativeMinutes = {
  up_to_30_minutes: 15,
  '30_minutes_to_1_hour': 45,
  '1_to_2_hours': 90,
  more_than_2_hours: 120
}

const frequencyDays = {
  daily: 1,
  weekly: 7,
  monthly: 365.25 / 12,
  yearly: 365.25
}

const smokingChangeAnswerKeys = {
  greater: 'smokingChangeIncrease',
  fewer: 'smokingChangeDecrease'
}

const toArray = (value) => Array.isArray(value) ? value : [value].filter(Boolean)

const getDailyMultiplier = (frequency) => {
  const days = frequencyDays[frequency]

  return days ? 1 / days : undefined
}

const normaliseQuantityPerDay = ({ type, quantity, frequency, smokingQuantityOther, issues = [], field }) => {
  const dailyMultiplier = getDailyMultiplier(frequency)

  if (dailyMultiplier === undefined) {
    issues.push({
      field: `${field}.smokingFrequency`,
      type: 'missing',
      message: 'Smoking frequency is required to derive cigarette-equivalent intensity.'
    })
    return undefined
  }

  if (type === 'rolling_tobacco') {
    const grams = rollingTobaccoRepresentativeGrams[quantity]

    if (grams === undefined) {
      issues.push({
        field: `${field}.smokingQuantity`,
        type: 'unmapped',
        message: 'Rolling tobacco quantity must be one of the configured gram bands.'
      })
      return undefined
    }

    issues.push({
      field: `${field}.smokingQuantity`,
      type: 'estimated',
      message: `Rolling tobacco band ${quantity} was converted using ${grams}g as the representative amount.`
    })

    return grams * 4 * dailyMultiplier
  }

  if (type === 'shisha') {
    const hours = quantity === 'another_amount' ? toNumber(smokingQuantityOther) : undefined
    const minutes = hours !== undefined ? hours * 60 : shishaRepresentativeMinutes[quantity]

    if (minutes === undefined) {
      issues.push({
        field: `${field}.smokingQuantity`,
        type: 'unmapped',
        message: 'Shisha quantity must be one of the configured time bands or another amount.'
      })
      return undefined
    }

    if (quantity !== 'another_amount') {
      issues.push({
        field: `${field}.smokingQuantity`,
        type: 'estimated',
        message: `Shisha band ${quantity} was converted using ${minutes} minutes as the representative amount.`
      })
    }

    return minutes * 1.25 * dailyMultiplier
  }

  const factor = cigaretteEquivalentFactors[type]
  const number = toNumber(quantity)

  if (!factor) {
    issues.push({
      field,
      type: 'unmapped',
      message: `Tobacco type ${type} cannot be converted to cigarette equivalents.`
    })
    return undefined
  }

  if (number === undefined) {
    issues.push({
      field: `${field}.smokingQuantity`,
      type: 'missing',
      message: 'Smoking quantity is required to derive cigarette-equivalent intensity.'
    })
    return undefined
  }

  return number * factor * dailyMultiplier
}

const isCurrentSmokingType = (answers = {}, type, answer = {}) => {
  if (answers.smoker === 'yes_previous') {
    return false
  }

  if (answer.smokingStatus === 'yes') {
    return true
  }

  if (answer.smokingStatus === 'no' || answer.smokingStatus === 'less_than_lifetime_threshold') {
    return false
  }

  const currentTypes = toArray(answers.smokingStatusCurrent).filter((value) => value !== 'no')

  if (currentTypes.length > 0) {
    return currentTypes.includes(type)
  }

  return answers.smoker === 'yes_current'
}

const getSelectedTobaccoTypes = (answers = {}) => {
  return toArray(answers.smokingType).filter((type) => type !== 'none')
}

const getStoppedYears = (answer = {}, fallback = {}) => {
  if (answer.periodsStoppedSmoking === 'yes') {
    return toNumber(answer.yearsStoppedSmoking) || 0
  }

  if (answer.periodsStoppedSmoking === 'no') {
    return 0
  }

  if (fallback.periodsStoppedSmoking === 'yes') {
    return toNumber(fallback.yearsStoppedSmoking) || 0
  }

  return 0
}

const getTypeDuration = ({ answers = {}, answer = {}, isCurrent, age, issues = [], field }) => {
  const yearsSmoked = toNumber(answer.yearsSmoked)

  if (yearsSmoked !== undefined) {
    return yearsSmoked
  }

  if (answer.yearsSmokedMoreThanOneYear === 'no') {
    issues.push({
      field: `${field}.yearsSmokedMoreThanOneYear`,
      type: 'estimated',
      message: 'Smoking duration of 1 year was used for a tobacco type smoked for no more than 1 year.'
    })
    return 1
  }

  const startAge = toNumber(answer.ageStartedSmoking) ?? toNumber(answers.ageStartedSmoking)
  const stoppedAge = isCurrent
    ? age
    : (toNumber(answer.ageStoppedSmoking) ?? toNumber(answers.ageStoppedSmoking))

  if (startAge === undefined || stoppedAge === undefined) {
    issues.push({
      field,
      type: 'missing',
      message: 'Age started and stopped smoking are required to derive smoking duration.'
    })
    return undefined
  }

  const duration = stoppedAge - startAge - getStoppedYears(answer, answers)

  if (!Number.isFinite(duration) || duration < 0) {
    issues.push({
      field,
      type: 'invalid',
      message: 'Derived smoking duration must not be negative.'
    })
    return undefined
  }

  return duration
}

const getTypeInterval = ({ answers = {}, answer = {}, isCurrent, age }) => {
  const startAge = toNumber(answer.ageStartedSmoking) ?? toNumber(answers.ageStartedSmoking)
  const stoppedAge = isCurrent
    ? age
    : (toNumber(answer.ageStoppedSmoking) ?? toNumber(answers.ageStoppedSmoking))

  if (startAge === undefined || stoppedAge === undefined || stoppedAge < startAge) {
    return undefined
  }

  return { startAge, stoppedAge }
}

const getUnionDuration = (intervals = []) => {
  const sorted = intervals
    .filter(Boolean)
    .sort((a, b) => a.startAge - b.startAge)

  if (sorted.length === 0) {
    return undefined
  }

  const merged = []

  sorted.forEach((interval) => {
    const previous = merged[merged.length - 1]

    if (previous && interval.startAge <= previous.stoppedAge) {
      previous.stoppedAge = Math.max(previous.stoppedAge, interval.stoppedAge)
      return
    }

    merged.push({ ...interval })
  })

  return merged.reduce((total, interval) => total + interval.stoppedAge - interval.startAge, 0)
}

const getChangeIntensityYears = ({ type, answer = {}, change, issues = [], field }) => {
  const answerKey = smokingChangeAnswerKeys[change]
  const changeAnswer = answer[answerKey] || {}
  const years = toNumber(changeAnswer.years)

  if (!answerKey || years === undefined) {
    return undefined
  }

  const dailyCigaretteEquivalents = normaliseQuantityPerDay({
    type,
    quantity: changeAnswer.quantity,
    frequency: changeAnswer.frequency || answer.smokingFrequency,
    smokingQuantityOther: changeAnswer.smokingQuantityOther,
    issues,
    field: `${field}.${answerKey}`
  })

  if (dailyCigaretteEquivalents === undefined) {
    return undefined
  }

  return {
    dailyCigaretteEquivalents,
    years
  }
}

const getShishaSettingDailyCigaretteEquivalents = ({ answer = {}, setting, issues = [], field }) => {
  const settingAnswer = answer[setting] || {}

  if (!settingAnswer.smokingQuantity && !settingAnswer.smokingFrequency) {
    return undefined
  }

  return normaliseQuantityPerDay({
    type: 'shisha',
    quantity: settingAnswer.smokingQuantity,
    frequency: settingAnswer.smokingFrequency,
    smokingQuantityOther: settingAnswer.smokingQuantityOther,
    issues,
    field: `${field}.${setting}`
  })
}

const getBaselineDailyCigaretteEquivalents = ({ type, answer = {}, issues = [], field }) => {
  if (type !== 'shisha' || answer.smokingFrequency || answer.smokingQuantity) {
    return normaliseQuantityPerDay({
      type,
      quantity: answer.smokingQuantity,
      frequency: answer.smokingFrequency,
      smokingQuantityOther: answer.smokingQuantityOther,
      issues,
      field
    })
  }

  const settingValues = toArray(answer.smokingSetting)
  const settingIntensities = settingValues
    .map((setting) => getShishaSettingDailyCigaretteEquivalents({ answer, setting, issues, field }))
    .filter((value) => value !== undefined)

  if (settingIntensities.length > 0) {
    return settingIntensities.reduce((total, value) => total + value, 0)
  }

  return normaliseQuantityPerDay({
    type,
    quantity: answer.smokingQuantity,
    frequency: answer.smokingFrequency,
    smokingQuantityOther: answer.smokingQuantityOther,
    issues,
    field
  })
}

const deriveTobaccoUse = (answers = {}, age, options = {}) => {
  const issues = options.issues || []
  const selectedTypes = getSelectedTobaccoTypes(answers)
  const typeSummaries = []
  const intervals = []
  let latestStoppedAge

  selectedTypes.forEach((type) => {
    const answer = answers[type] || {}
    const field = type
    const isCurrent = isCurrentSmokingType(answers, type, answer)
    const duration = getTypeDuration({ answers, answer, isCurrent, age, issues, field })
    const interval = getTypeInterval({ answers, answer, isCurrent, age })

    if (interval) {
      intervals.push(interval)
      latestStoppedAge = isCurrent ? latestStoppedAge : Math.max(latestStoppedAge || 0, interval.stoppedAge)
    }

    const baselineDailyCigaretteEquivalents = getBaselineDailyCigaretteEquivalents({
      type,
      answer,
      issues,
      field
    })

    const changeIntensityYears = toArray(answer.smokingChange)
      .filter((change) => change !== 'no')
      .map((change) => getChangeIntensityYears({ type, answer, change, issues, field }))
      .filter(Boolean)

    const changedYears = changeIntensityYears.reduce((total, item) => total + item.years, 0)
    const baselineYears = duration !== undefined ? Math.max(duration - changedYears, 0) : undefined

    if (duration !== undefined && changedYears > duration) {
      issues.push({
        field: `${field}.smokingChange`,
        type: 'invalid',
        message: 'Changed smoking years are greater than the derived duration for this tobacco type.'
      })
    }

    const cigaretteEquivalentYearParts = [
      baselineYears !== undefined && baselineDailyCigaretteEquivalents !== undefined
        ? baselineDailyCigaretteEquivalents * baselineYears
        : undefined,
      ...changeIntensityYears.map((item) => item.dailyCigaretteEquivalents * item.years)
    ].filter((value) => value !== undefined)
    const cigaretteEquivalentYears = cigaretteEquivalentYearParts.length > 0
      ? cigaretteEquivalentYearParts.reduce((total, value) => total + value, 0)
      : undefined

    typeSummaries.push({
      type,
      isCurrent,
      duration,
      baselineDailyCigaretteEquivalents,
      baselineYears,
      changeIntensityYears,
      cigaretteEquivalentYears
    })
  })

  const hasCurrentSmoking = typeSummaries.some((summary) => summary.isCurrent)
  const intervalDuration = getUnionDuration(intervals)
  const maxTypeDuration = Math.max(0, ...typeSummaries.map((summary) => summary.duration || 0))
  const smokingDuration = intervalDuration ?? maxTypeDuration
  const hasCompleteIntensity = typeSummaries.length > 0 && typeSummaries.every((summary) => {
    return summary.cigaretteEquivalentYears !== undefined
  })
  const totalCigaretteEquivalentYears = hasCompleteIntensity
    ? typeSummaries.reduce((total, summary) => total + summary.cigaretteEquivalentYears, 0)
    : undefined
  const smokingIntensity = hasCompleteIntensity && smokingDuration > 0
    ? totalCigaretteEquivalentYears / smokingDuration
    : undefined

  if (selectedTypes.length > 1 && intervals.length < selectedTypes.length) {
    issues.push({
      field: 'smokingType',
      type: 'estimated',
      message: 'Multiple tobacco products were selected, but product overlap cannot be derived exactly from the available answers.'
    })
  }

  return {
    selectedTypes,
    smokingStatus: hasCurrentSmoking ? 'current' : 'former',
    smokingDuration,
    smokingIntensity,
    quitYears: hasCurrentSmoking || latestStoppedAge === undefined || age === undefined ? 0 : age - latestStoppedAge,
    typeSummaries,
    issues
  }
}

module.exports = {
  cigaretteEquivalentFactors,
  deriveTobaccoUse,
  frequencyDays,
  getSelectedTobaccoTypes,
  isCurrentSmokingType,
  normaliseQuantityPerDay,
  rollingTobaccoRepresentativeGrams,
  shishaRepresentativeMinutes
}
