const { view } = require('../lib/settings')

exports.pageNotFound = (req, res) => {
  res.status(404).render(view('errors/404'))
}

exports.unexpectedError = (req, res) => {
  res.status(500).render(view('errors/500'))
}

exports.serviceUnavailable = (req, res) => {
  res.status(503).render(view('errors/503'))
}
