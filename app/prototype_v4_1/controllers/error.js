const version = 'v4_1'

exports.pageNotFound = (req, res) => {
  res.status(404).render(`prototype_${version}/views/errors/404`)
}

exports.unexpectedError = (req, res) => {
  res.status(500).render(`prototype_${version}/views/errors/500`)
}

exports.serviceUnavailable = (req, res) => {
  res.status(503).render(`prototype_${version}/views/errors/503`)
}
