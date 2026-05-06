module.exports = (req, res, next) => {
  // You can set any additional local variables here.
  // These will be made available to any views
  //
  // For example:
  //
  // res.locals.organisationName = 'NHS'

  res.locals.serviceEmail = 'england.digitallungcancerscreening@nhs.net'

  next()
}
