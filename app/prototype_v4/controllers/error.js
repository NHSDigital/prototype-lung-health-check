exports.pageNotFound = (req, res) => {
  res.status(404).render('prototype_v4/views/errors/404')
}

exports.unexpectedError = (req, res) => {
  res.status(500).render('prototype_v4/views/errors/500')
}

exports.serviceUnavailable = (req, res) => {
  res.status(503).render('prototype_v4/views/errors/503')
}
