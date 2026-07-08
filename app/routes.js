// External dependencies
const express = require('express')
const path = require('path')

const router = express.Router()

router.use('/assets/vendor/mermaid', express.static(path.join(__dirname, '..', 'node_modules', 'mermaid', 'dist')))

router.use(require('./prototype_v1/routes'))
router.use(require('./prototype_v2/routes'))
router.use(require('./prototype_v3/routes'))
router.use(require('./prototype_v4/routes'))
router.use(require('./prototype_v4_1/routes'))
router.use(require('./prototype_v4_2/routes'))
router.use(require('./prototype_v4_3/routes'))
router.use(require('./prototype_v4_4/routes'))

// Add your routes here - above the module.exports line

module.exports = router
