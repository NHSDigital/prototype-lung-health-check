const { path: prototypePath, view } = require('../lib/settings')

exports.signIn_get = (req, res) => {
  delete req.session.data

  res.render(view('authentication/sign-in'), {
    actions: {
      back: prototypePath,
      next: `${prototypePath}/sign-in`
    }
  })
}

exports.signIn_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in'), {
      errors,
      actions: {
        back: prototypePath,
        next: `${prototypePath}/sign-in`
      }
    })
  } else {
    res.redirect(`${prototypePath}/security-code`)
  }
}

exports.securityCode_get = (req, res) => {
  res.render(view('authentication/security-code'), {
    actions: {
      back: `${prototypePath}/sign-in`,
      next: `${prototypePath}/security-code`
    }
  })
}

exports.securityCode_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/security-code'), {
      errors,
      actions: {
        back: `${prototypePath}/sign-in`,
        next: `${prototypePath}/security-code`
      }
    })
  } else {
    req.session.data = req.session.data || {}
    req.session.data['logged-in'] = true
    res.redirect(`${prototypePath}/sign-in-agreement`)
  }
}

exports.signInAgreement_get = (req, res) => {
  res.render(view('authentication/sign-in-agreement'), {
    actions: {
      back: `${prototypePath}/security-code`,
      accept: `${prototypePath}/sign-in-agreement`,
      decline: `${prototypePath}/sign-in-agreement-declined`
    }
  })
}

exports.signInAgreement_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in-agreement'), {
      errors,
      actions: {
        back: `${prototypePath}/security-code`,
        accept: `${prototypePath}/sign-in-agreement`,
        decline: `${prototypePath}/sign-in-agreement-declined`
      }
    })
  } else {
    res.redirect(`${prototypePath}/accept-terms`)
  }
}

exports.signInAgreementDeclined_get = (req, res) => {
  res.render(view('authentication/sign-in-agreement-declined'), {
    actions: {
      back: prototypePath
    }
  })
}
