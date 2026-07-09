const version = 'v4'
const view = (template) => {
  return `prototype_${version}/views/${template}`
}

exports.signIn_get = (req, res) => {
  delete req.session.data

  res.render(view('authentication/sign-in'), {
    actions: {
      back: '/prototype_v4',
      next: '/prototype_v4/sign-in'
    }
  })
}

exports.signIn_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in'), {
      errors,
      actions: {
        back: '/prototype_v4',
        next: '/prototype_v4/sign-in'
      }
    })
  } else {
    res.redirect('/prototype_v4/security-code')
  }
}

exports.securityCode_get = (req, res) => {
  res.render(view('authentication/security-code'), {
    actions: {
      back: '/prototype_v4/sign-in',
      next: '/prototype_v4/security-code'
    }
  })
}

exports.securityCode_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/security-code'), {
      errors,
      actions: {
        back: '/prototype_v4/sign-in',
        next: '/prototype_v4/security-code'
      }
    })
  } else {
    req.session.data = req.session.data || {}
    req.session.data['logged-in'] = true
    res.redirect('/prototype_v4/sign-in-agreement')
  }
}

exports.signInAgreement_get = (req, res) => {
  res.render(view('authentication/sign-in-agreement'), {
    actions: {
      back: '/prototype_v4/security-code',
      accept: '/prototype_v4/sign-in-agreement',
      decline: '/prototype_v4/sign-in-agreement-declined'
    }
  })
}

exports.signInAgreement_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in-agreement'), {
      errors,
      actions: {
        back: '/prototype_v4/security-code',
        accept: '/prototype_v4/sign-in-agreement',
        decline: '/prototype_v4/sign-in-agreement-declined'
      }
    })
  } else {
    res.redirect('/prototype_v4/accept-terms')
  }
}

exports.signInAgreementDeclined_get = (req, res) => {
  res.render(view('authentication/sign-in-agreement-declined'), {
    actions: {
      back: '/prototype_v4'
    }
  })
}
