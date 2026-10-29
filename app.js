const NHSPrototypeKit = require('nhsuk-prototype-kit')

// Local dependencies
const config = require('./app/config')
const sessionDataDefaults = require('./app/data/session-data-defaults')
const filters = require('./app/filters')
const locals = require('./app/locals')
const routes = require('./app/routes')

const viewsPath = [
  'app/',
  'app/views/'
]

const entryPoints = [
  'app/assets/sass/main.scss',
  'app/assets/javascript/*.js'
]

async function init () {
  const prototype = await NHSPrototypeKit.init({
    serviceName: config.serviceName,
    buildOptions: {
      entryPoints
    },
    viewsPath,
    routes,
    locals,
    filters,
    sessionDataDefaults
  })

  const AutoRoutingView = prototype.app.get('view')

  prototype.app.set('view', class extends AutoRoutingView {
    constructor (name, options) {
      super(name, options)

      // Versioned templates live under app/prototype_*, outside app/views.
      if (name.startsWith('prototype_')) {
        this.path = this.path.replace(/^views[/\\]/, '')
      }
    }
  })

  prototype.start(config.port)
}

init()
