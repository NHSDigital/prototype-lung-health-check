const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const contentDirectory = path.join(__dirname, '..', 'content')

const renderContent = (fileName) => (_req, res, next) => {
  const filePath = path.join(contentDirectory, `${fileName}.md`)

  fs.readFile(filePath, 'utf8', (error, file) => {
    if (error) {
      return next(error)
    }

    const parsed = matter(file)

    res.render('prototype_v4/views/content/show', {
      content: parsed.content,
      contentData: {
        contents: {
          items: []
        },
        ...parsed.data
      }
    })
  })
}

exports.accessibility = renderContent('accessibility')
exports.contact = renderContent('contact')
exports.cookies = renderContent('cookies')
exports.privacy = renderContent('privacy')
exports.terms = renderContent('terms')
