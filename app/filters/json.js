const safeJson = (value) => {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

const prettyJson = (value) => {
  return JSON.stringify(value, null, 2)
}

module.exports = {
  prettyJson,
  safeJson
}
