const diagrams = document.querySelectorAll('.mermaid')
const mermaidUrl = '/assets/vendor/mermaid/mermaid.esm.min.mjs'

const renderMermaidDiagrams = async () => {
  const { default: mermaid } = await import(mermaidUrl)

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base'
  })

  await mermaid.run({
    nodes: diagrams
  })
}

if (diagrams.length) {
  renderMermaidDiagrams()
}
