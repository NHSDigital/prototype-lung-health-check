require('dotenv').config({ quiet: true })

// Use this file to change prototype configuration.

const getEnv = (name, fallback) => {
  if (process.env[name] === undefined) {
    return fallback
  }

  return process.env[name]
}

const getPort = () => {
  const port = Number.parseInt(getEnv('PORT', '3000'), 10)

  if (Number.isNaN(port)) {
    return 3000
  }

  return port
}

const getBooleanEnv = (name, fallback = false) => {
  const value = getEnv(name)

  if (value === undefined) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

module.exports = {
  // Service name
  serviceName: getEnv('SERVICE_NAME', 'Check if you need a lung scan'),

  // Port to run nodemon on locally
  port: getPort(),

  // Automatically stores form data, and send to all views
  useAutoStoreData: 'true',

  // Enable cookie-based session store (persists on restart)
  // Please note 4KB cookie limit per domain, cookies too large will silently be ignored
  useCookieSessionStore: 'false',

  phaseBanner: {
    tagText: getEnv('PHASE_BANNER_TAG_TEXT', 'Prototype'),
    tagClasses: getEnv('PHASE_BANNER_TAG_CLASSES', 'nhsuk-tag--blue')
  },

  riskSummaryDebug: getBooleanEnv('RISK_SUMMARY_DEBUG')
}
