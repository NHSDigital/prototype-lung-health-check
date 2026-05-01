// External dependencies
const express = require('express')

const router = express.Router()

router.use(require('./views/prototype_v1/routes'))
router.use(require('./views/prototype_v2/routes'))
router.use(require('./views/prototype_v3/routes'))

// Add your routes here - above the module.exports line

module.exports = router
