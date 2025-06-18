module.exports = function (env) { /* eslint-disable-line func-names,no-unused-vars */
  const filters = {};

filters.nhsDate = function(dateInput) {
  // Handle empty input
  if (!dateInput) {
    return ''
  }

  let day, month, year

  // Handle both array and object formats
  if (Array.isArray(dateInput)) {
    // Array format: [day, month, year]
    if (dateInput.length !== 3) {
      return ''
    }
    [day, month, year] = dateInput
  } else if (typeof dateInput === 'object') {
    // Object format: {day: x, month: y, year: z}
    day = dateInput.day
    month = dateInput.month
    year = dateInput.year
  } else {
    return ''
  }

  // Handle empty values
  if (!day || !month || !year) {
    return ''
  }

  // Month names array (index 0 = January)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Convert strings to numbers and validate
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)

  // Validate ranges
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1000) {
    return ''
  }

  // Format: "1 January 2020"
  return `${dayNum} ${monthNames[monthNum - 1]} ${yearNum}`
}


  return filters;
};
