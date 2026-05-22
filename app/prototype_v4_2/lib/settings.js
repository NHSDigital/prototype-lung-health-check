const version = 'v4_2'
const name = `prototype_${version}`
const path = `/${name}`
const viewPath = `${name}/views`

const view = (template) => {
  return `${viewPath}/${template}`
}

const locals = {
  version,
  name,
  path,
  viewPath
}

module.exports = {
  locals,
  name,
  path,
  version,
  view,
  viewPath
}
