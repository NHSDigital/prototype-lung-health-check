const telephoneLink = (telephone) => {
  if (!telephone) {
    return ''
  }

  const text = String(telephone)
  const href = text.replace(/[^\d+]/g, '')

  return `[${text}](tel:${href})`
}

module.exports = { telephoneLink }
