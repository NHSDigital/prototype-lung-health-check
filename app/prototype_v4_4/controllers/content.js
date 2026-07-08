const path = require('path')
const { renderMarkdownFile } = require('../../lib/content-renderer')
const { view } = require('../lib/settings')

const contentDirectory = path.join(__dirname, '..', 'content')
const docsDirectory = path.join(__dirname, '..', 'docs')

const renderContent = (fileName) => renderMarkdownFile({ directory: contentDirectory, fileName, view })
const renderDocs = (fileName) => renderMarkdownFile({
  directory: docsDirectory,
  fileName,
  view,
  data: {
    fullWidth: true,
    hasMermaid: true,
    hidePhaseBanner: true
  },
  stripFirstHeading: true,
  renderTemplate: false
})

exports.accessibility = renderContent('accessibility')
exports.contact = renderContent('contact')
exports.cookies = renderContent('cookies')
exports.privacy = renderContent('privacy')
exports.terms = renderContent('terms')
exports.paused = renderContent('paused')
exports.closed = renderContent('closed')
exports.questionFlow = renderDocs('question-flow')
