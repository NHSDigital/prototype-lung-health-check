// External dependencies
const express = require('express')

const router = express.Router()

router.use(require('./prototype_v1/routes'))
router.use(require('./prototype_v2/routes'))
router.use(require('./prototype_v3/routes'))
router.use(require('./prototype_v4/routes'))

// Add your routes here - above the module.exports line

module.exports = router
