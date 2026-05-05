const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const version = 'v4'
const viewsDirectory = path.join(__dirname, 'views')

const view = (template) => {
  return `prototype_${version}/views/${template}`
}

const hasView = (template) => {
  if (!template || template.includes('..')) {
    return false
  }

  const templatePath = path.join(viewsDirectory, `${template}.html`)
  return templatePath.startsWith(viewsDirectory) && fs.existsSync(templatePath)
}

/// ------------------------------------------------------------------------ ///
/// Controller modules - used for routing
/// ------------------------------------------------------------------------ ///

const contentController = require('./controllers/content')
const errorController = require('./controllers/error')

/// ------------------------------------------------------------------------ ///
///
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4', (_req, res) => {
  res.render(view('index'))
})

/// ------------------------------------------------------------------------ ///
/// Static pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/accessibility-statement', contentController.accessibility)

router.get('/prototype_v4/contact-us', contentController.contact)

router.get('/prototype_v4/cookies', contentController.cookies)

router.get('/prototype_v4/privacy-policy', contentController.privacy)

router.get('/prototype_v4/terms-of-use', contentController.terms)

/// ------------------------------------------------------------------------ ///
/// Error pages
/// ------------------------------------------------------------------------ ///

router.get('/prototype_v4/404', errorController.pageNotFound)
router.get('/prototype_v4/page-not-found', errorController.pageNotFound)

router.get('/prototype_v4/500', errorController.unexpectedError)
router.get('/prototype_v4/server-error', errorController.unexpectedError)

router.get('/prototype_v4/503', errorController.serviceUnavailable)
router.get('/prototype_v4/service-unavailable', errorController.serviceUnavailable)

/// ------------------------------------------------------------------------ ///
/// Add your routes above
/// ------------------------------------------------------------------------ ///

router.get(/^\/prototype_v4\/(.+)$/, (req, res, next) => {
  const template = req.params[0]

  if (!hasView(template)) {
    return errorController.pageNotFound(req, res)
  }

  res.render(view(template))
})

module.exports = router
