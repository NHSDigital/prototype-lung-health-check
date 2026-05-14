/**
 * Convert date-of-birth answer parts into a Date object.
 *
 * @param {Object} answers - Session answers object.
 * @returns {Date|boolean} Date of birth, or false when the parts are invalid.
 */
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

/**
 * Calculate an age in years from a Date.
 *
 * @param {Date} dateOfBirth - Date of birth.
 * @returns {number} Age in years.
 */
const getAge = (dateOfBirth) => {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Check whether a person is in the scan-eligible age range.
 *
 * @param {Date} dateOfBirth - Date of birth.
 * @returns {boolean} True when age is between 55 and 74 inclusive.
 */
const isEligibleForScanAge = (dateOfBirth) => {
  const age = getAge(dateOfBirth)

  return age >= 55 && age <= 74
}

module.exports = {
  getAge,
  getDateOfBirth,
  isEligibleForScanAge
}
