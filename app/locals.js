module.exports = (req, res, next) => {
  // You can set any additional local variables here.
  // These will be made available to any views
  //
  // For example:
  //
  // res.locals.organisationName = 'NHS'

  res.locals.serviceUrl = 'digital-lung-cancer-screening.nhs.uk'
  res.locals.serviceEmail = 'england.digitallungcancerscreening@nhs.net'
  res.locals.serviceTelephone = '020 3835 1600'

  next()
}
