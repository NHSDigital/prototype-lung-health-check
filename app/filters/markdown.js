const MarkdownIt = require('markdown-it')

const markdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

/* ------------------------------------------------------------------
utility function to parse markdown as HTML
example: {{ "## Title" | markdownToHtml }}
outputs: "<h2>Title</h2>"
------------------------------------------------------------------ */
const markdownToHtml = (markdown) => {
  if (!markdown) {
    return null
  }

  const text = markdown.replace(/\\r/g, '\n').replace(/\\t/g, ' ')
  const html = markdownIt.render(text)

  // Add nhsuk-* classes
  let nhsukHtml = html.replace(/<p>/g, '<p class="nhsuk-body">')
  nhsukHtml = nhsukHtml.replace(/<ol>/g, '<ol class="nhsuk-list nhsuk-list--number">')
  nhsukHtml = nhsukHtml.replace(/<ul>/g, '<ul class="nhsuk-list nhsuk-list--bullet">')
  nhsukHtml = nhsukHtml.replace(/<h2/g, '<h2 class="nhsuk-heading-l"')
  nhsukHtml = nhsukHtml.replace(/<h3/g, '<h3 class="nhsuk-heading-m"')
  nhsukHtml = nhsukHtml.replace(/<h4/g, '<h4 class="nhsuk-heading-s"')

  return nhsukHtml
}

module.exports = { markdownToHtml }
