const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const getFirstHeading = (markdown = '') => {
  const match = markdown.match(/^#\s+(.+?)\s*$/m)

  return match?.[1]
}

const removeFirstHeading = (markdown = '') => {
  return markdown.replace(/^#\s+.+?\s*(?:\r?\n)+/, '')
}

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

const renderMarkdownFile = ({
  directory,
  fileName,
  view,
  data = {},
  stripFirstHeading = false,
  renderTemplate = true
}) => (req, res, next) => {
  const filePath = path.join(directory, `${fileName}.md`)

  fs.readFile(filePath, 'utf8', (error, file) => {
    if (error) {
      return next(error)
    }

    let contentData
    let renderedMarkdown

    try {
      const parsed = matter(file)
      const nunjucks = req.app.get('nunjucksEnv')
      let markdown = parsed.content
      const title = parsed.data.title || getFirstHeading(markdown)
      const renderedData = renderNunjucksData(parsed.data, nunjucks, res.locals)

      if (stripFirstHeading) {
        markdown = removeFirstHeading(markdown)
      }

      contentData = {
        contents: {
          items: []
        },
        ...data,
        ...renderedData
      }

      if (!contentData.title && title) {
        contentData.title = title
      }

      contentData.hasMermaid = contentData.hasMermaid || /```mermaid\b/.test(markdown)

      const templateContext = {
        ...res.locals,
        contentData
      }

      renderedMarkdown = renderTemplate
        ? nunjucks.renderString(markdown, templateContext)
        : markdown
    } catch (error) {
      return next(error)
    }

    res.render(view('content/show'), {
      content: renderedMarkdown,
      contentData
    })
  })
}

module.exports = {
  renderMarkdownFile
}
