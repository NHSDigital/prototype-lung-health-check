const marked = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')

// Configure marked once at module load time (instead of on every call)
marked.use(gfmHeadingId())

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
  const html = marked.parse(text)

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
