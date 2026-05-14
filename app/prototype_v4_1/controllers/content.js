const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const version = 'v4_1'

const contentDirectory = path.join(__dirname, '..', 'content')

const renderNunjucksData = (value, nunjucks, context) => {
  if (typeof value === 'string') {
    return nunjucks.renderString(value, context)
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderNunjucksData(item, nunjucks, context))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        renderNunjucksData(item, nunjucks, context)
      ])
    )
  }

  return value
}

const renderContent = (fileName) => (req, res, next) => {
  const filePath = path.join(contentDirectory, `${fileName}.md`)

  fs.readFile(filePath, 'utf8', (error, file) => {
    if (error) {
      return next(error)
    }

    let contentData
    let renderedMarkdown

    try {
      const parsed = matter(file)
      const nunjucks = req.app.get('nunjucksEnv')
      const renderedData = renderNunjucksData(parsed.data, nunjucks, res.locals)

      contentData = {
        contents: {
          items: []
        },
        ...renderedData
      }

      const templateContext = {
        ...res.locals,
        contentData
      }

      renderedMarkdown = nunjucks.renderString(parsed.content, templateContext)
    } catch (error) {
      return next(error)
    }

    res.render(`prototype_${version}/views/content/show`, {
      content: renderedMarkdown,
      contentData
    })
  })
}

exports.accessibility = renderContent('accessibility')
exports.contact = renderContent('contact')
exports.cookies = renderContent('cookies')
exports.privacy = renderContent('privacy')
exports.terms = renderContent('terms')
