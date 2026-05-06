const { DateTime } = require('luxon')

const ALLOWED_VALUES_FOR_MONTHS = [
  ['1', '01', 'jan', 'january'],
  ['2', '02', 'feb', 'february'],
  ['3', '03', 'mar', 'march'],
  ['4', '04', 'apr', 'april'],
  ['5', '05', 'may'],
  ['6', '06', 'jun', 'june'],
  ['7', '07', 'jul', 'july'],
  ['8', '08', 'aug', 'august'],
  ['9', '09', 'sep', 'september'],
  ['10', 'oct', 'october'],
  ['11', 'nov', 'november'],
  ['12', 'dec', 'december']
]

/**
 * Formats a timestamp into GOV.UK date format (e.g. "5 May 2024").
 * @param {Date|string} timestamp - A JS Date object or a date string.
 * @returns {string} The formatted date string.
 */
const nhsukDate = (timestamp) => {
  const format = 'd MMMM yyyy'

  let datetime = DateTime.fromJSDate(timestamp, { locale: 'en-GB' }).toFormat(format)

  if (datetime === 'Invalid DateTime') {
    datetime = DateTime.fromISO(timestamp, { locale: 'en-GB' }).toFormat(format)
  }

  return datetime
}

/**
 * Formats a timestamp into a 12-hour GOV.UK-style time string (e.g. "3pm", "12am (midnight)").
 * @param {Date|string} timestamp - A JS Date object or a date string.
 * @returns {string} The formatted time string.
 */
const nhsukTime = (timestamp) => {
  let datetime = DateTime.fromJSDate(timestamp, { locale: 'en-GB' })

  if (datetime === 'Invalid DateTime') {
    datetime = DateTime.fromISO(timestamp, { locale: 'en-GB' })
  }

  const hour = datetime.toFormat('h:mm').replace(':00', '')
  const meridiem = datetime.toFormat('a').toLowerCase()

  let time = `${hour}${meridiem}`

  if (time === '12am') {
    time = '12am (midnight)'
  } else if (time === '12pm') {
    time = '12pm (midday)'
  }

  return time
}

/**
 * Combines GOV.UK-style formatted date and time into a single string.
 * @param {Date|string} timestamp - A date/time string or object.
 * @param {boolean|string} [format=false] - If 'on', outputs "time on date".
 * @returns {string} A human-readable string combining date and time.
 */
const nhsukDateTime = (timestamp, format = false) => {
  if (timestamp === 'today' || timestamp === 'now') {
    timestamp = DateTime.now().toString()
  }

  const date = nhsukDate(timestamp)
  const time = nhsukTime(timestamp)

  return format === 'on' ? `${time} on ${date}` : `${date} at ${time}`
}

/**
 * Parses user input into a numeric month value if it matches allowed formats.
 * @param {string} input - Raw user input for a month (e.g. "Feb", "2", "02").
 * @returns {string|undefined} The normalised numeric month as string or undefined.
 */
const parseMonth = (input) => {
  if (input == null) return undefined
  const trimmedLowerCaseInput = input.trim().toLowerCase()
  return ALLOWED_VALUES_FOR_MONTHS.find((month) =>
    month.find((allowedValue) => allowedValue === trimmedLowerCaseInput)
  )?.[0]
}

/**
 * Converts a date input object (e.g. from a form) into an ISO date string.
 * @param {Object} object - Object containing date fields.
 * @param {string} [namePrefix] - Optional prefix for date field names.
 * @returns {string} ISO date string (e.g. "2024-05-20") or partial (e.g. "2024-05").
 */
const isoDateFromDateInput = (object, namePrefix) => {
  let day, month, year

  if (namePrefix) {
    day = Number(object[`${namePrefix}-day`])
    month = Number(parseMonth(object[`${namePrefix}-month`]))
    year = Number(object[`${namePrefix}-year`])
  } else {
    day = Number(object?.day)
    month = Number(parseMonth(object?.month))
    year = Number(object?.year)
  }

  try {
    if (!day) {
      return DateTime.local(year, month).toFormat('yyyy-LL')
    }

    return DateTime.local(year, month, day).toISODate()
  } catch (error) {
    return error.message.split(':')[0]
  }
}

const asUTCDate = (y, m, d) => new Date(Date.UTC(y, m - 1, d))

const toISODateString = ({ year, month, day }) => {
  if (!year || !month || !day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Checks whether a given value is a valid Date.
 * @param {*} value - Any input value.
 * @returns {boolean} True if the value can be parsed into a valid Date.
 */
const isValidDate = (value) => {
  const date = new Date(value)
  return date instanceof Date && !isNaN(date)
}

/**
 * Extracts day, month and year parts from a timestamp.
 * @param {Date|string} timestamp - The date to extract parts from.
 * @returns {{day: number, month: number, year: number}|null}
 */
const getDateParts = (timestamp) => {
  if (!isValidDate(timestamp)) {
    return null
  }

  const date = new Date(timestamp)

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  }
}

/**
 * Extracts the day from a timestamp.
 * @param {Date|string} timestamp - The date to extract from.
 * @returns {number|null} Day of the month, or null if invalid.
 */
const getDay = (timestamp) => {
  if (!isValidDate(timestamp)) {
    return null
  }

  return new Date(timestamp).getDate()
}

/**
 * Extracts the month from a timestamp.
 * @param {Date|string} timestamp - The date to extract from.
 * @returns {number|null} Month (1–12), or null if invalid.
 */
const getMonth = (timestamp) => {
  if (!isValidDate(timestamp)) {
    return null
  }

  return new Date(timestamp).getMonth() + 1
}

/**
 * Extracts the year from a timestamp.
 * @param {Date|string} timestamp - The date to extract from.
 * @returns {number|null} Year, or null if invalid.
 */
const getYear = (timestamp) => {
  if (!isValidDate(timestamp)) {
    return null
  }

  return new Date(timestamp).getFullYear()
}

/**
 * Checks if the given date is today.
 * @param {Date|string|number} input - A Date object or something convertible to a Date.
 * @returns {boolean}
 */
const isToday = (input) => {
  const date = new Date(input)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * Checks if the given date is tomorrow.
 * @param {Date|string|number} input - A Date object or something convertible to a Date.
 * @returns {boolean}
 */
const isTomorrow = (input) => {
  const date = new Date(input)
  const tomorrow = new Date()

  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  )
}

/**
 * Checks if the given date is yesterday.
 * @param {Date|string|number} input - A Date object or something convertible to a Date.
 * @returns {boolean}
 */
const isYesterday = (input) => {
  const date = new Date(input)
  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
}

module.exports = {
  nhsukDate,
  nhsukDateTime,
  nhsukTime,
  isoDateFromDateInput,
  toISODateString,
  asUTCDate,
  isValidDate,
  getDateParts,
  getDay,
  getMonth,
  getYear,
  isToday,
  isTomorrow,
  isYesterday
}
