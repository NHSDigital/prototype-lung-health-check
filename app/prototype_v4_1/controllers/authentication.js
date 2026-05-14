const version = 'v4_1'
const view = (template) => {
  return `prototype_${version}/views/${template}`
}

exports.signIn_get = (req, res) => {
  delete req.session.data

  res.render(view('authentication/sign-in'), {
    actions: {
      back: `/prototype_${version}`,
      next: `/prototype_${version}/sign-in`
    }
  })
}

exports.signIn_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in'), {
      errors,
      actions: {
        back: `/prototype_${version}`,
        next: `/prototype_${version}/sign-in`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/security-code`)
  }
}

exports.securityCode_get = (req, res) => {

  res.render(view('authentication/security-code'), {
    actions: {
      back: `/prototype_${version}/sign-in`,
      next: `/prototype_${version}/security-code`
    }
  })
}

exports.securityCode_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/security-code'), {
      errors,
      actions: {
        back: `/prototype_${version}/sign-in`,
        next: `/prototype_${version}/security-code`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/sign-in-agreement`)
  }
}

exports.signInAgreement_get = (req, res) => {

  res.render(view('authentication/sign-in-agreement'), {
    actions: {
      back: `/prototype_${version}/security-code`,
      accept: `/prototype_${version}/sign-in-agreement`,
      decline: `/prototype_${version}/sign-in-agreement-declined`
    }
  })
}

exports.signInAgreement_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render(view('authentication/sign-in-agreement'), {
      errors,
      actions: {
        back: `/prototype_${version}/security-code`,
        accept: `/prototype_${version}/sign-in-agreement`,
        decline: `/prototype_${version}/sign-in-agreement-declined`
      }
    })
  } else {
    res.redirect(`/prototype_${version}/accept-terms`)
  }
}

exports.signInAgreementDeclined_get = (req, res) => {

  res.render(view('authentication/sign-in-agreement-declined'), {
    actions: {
      back: `/prototype_${version}`
    }
  })
}
