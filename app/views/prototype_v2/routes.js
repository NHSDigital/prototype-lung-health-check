// External dependencies
const express = require('express')
const router = express.Router()

/// //////////////
// Prototype 2 //
/// //////////////

router.post('/prototype_v2/relatives-with-cancer-answer', (request, response) => {
  const relativesHaveCancer = request.session.data.relativesHaveCancer

  if (relativesHaveCancer == 'Yes') {
  // If relatives had cancer, ask about their age first
    response.redirect('/prototype_v2/relatives-age-when-diagnosed')
  } else if (relativesHaveCancer == 'No' || relativesHaveCancer == "I don't know") {
  // No relatives with cancer OR don't know, go straight to age started smoking
    response.redirect('/prototype_v2/how-old-when-started-smoking')
  } else {
  // No answer provided, redirect back to the question
    response.redirect('/prototype_v2/relatives-with-cancer')
  }
})

router.post('/prototype_v2/relatives-age-answer', (request, response) => {
  response.redirect('/prototype_v2/how-old-when-started-smoking')
})

router.get('/prototype_v2/start-journey', (request, response) => {
  delete request.session.data
  response.redirect('/prototype_v2/have-you-completed-by-phone')
})

router.post('/prototype_v2/have-you-completed-by-phone-answer', (request, response) => {
  const completedByPhone = request.session.data.completedByPhone

  if (completedByPhone === 'Yes') {
    // If they've already completed by phone, redirect to exit page
    response.redirect('/prototype_v2/completed-by-phone-exit')
  } else if (completedByPhone === 'No') {
    // If they haven't completed by phone, continue to eligibility
    response.redirect('/prototype_v2/eligibility-have-you-ever-smoked')
  } else {
    // If no answer provided, redirect back to the question
    response.redirect('/prototype_v2/have-you-completed-by-phone')
  }
})

router.post('/prototype_v2/smokedRegularlyAnswer', (request, response) => {
  const smokedRegularly = request.session.data.smokedRegularly
  if (smokedRegularly == 'Yes-currently') {
    response.redirect('/prototype_v2/eligibility-what-is-your-date-of-birth')
  } else if (smokedRegularly == 'Yes-usedToRegularly') {
    response.redirect('/prototype_v2/eligibility-what-is-your-date-of-birth')
  } else if (smokedRegularly == 'Yes-usedToFewTimes') {
    response.redirect('/prototype_v2/drop-out-never-smoked')
  } else if (smokedRegularly == 'No') {
    response.redirect('/prototype_v2/drop-out-never-smoked')
  } else {
    response.redirect('/prototype_v2/eligibility-have-you-ever-smoked')
  }
})

router.post('/prototype_v2/smokeNowAnswer', (request, response) => {
  const smokeNow = request.session.data.smokeNow
  if (smokeNow == 'Yes') {
    response.redirect('/prototype_v2/current-smoker-how-many-years')
  } else if (smokeNow == 'No') {
    response.redirect('/prototype_v2/former-smoker-when-quit-smoking')
  } else {
    response.redirect('/prototype_v2/do-you-smoke-now')
  }
})

router.post('/prototype_v2/who-should-not-use-answer', (request, response) => {
  const smokeNow = request.session.data.canYouContinue
  if (smokeNow == 'Yes') {
    response.redirect('/prototype_v2/drop-out-bmi')
  } else if (smokeNow == 'No') {
    response.redirect('/prototype_v2/what-is-your-height')
  } else {
    response.redirect('/prototype_v2/who-should-not-use-this-online-service')
  }
})

router.post('/prototype_v2/whatDoYouSmokeAnswer', (request, response) => {
  let selectedTobacco = request.session.data.whatSmokeNow

  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : []
  }

  // Define page mapping in order (matches checkbox order)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ]

  // Create queue of pages to visit
  const pagesToVisit = []
  tobaccoPages.forEach(function (tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page)
    }
  })

  // Store the queue in session
  request.session.data.tobaccoPageQueue = pagesToVisit
  request.session.data.currentTobaccoPageIndex = 0

  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0])
  } else {
    response.redirect('/prototype_v2/check-your-answers')
  }
})

router.post('/prototype_v2/dateOfBirthAnswer', (request, response) => {
  const day = request.session.data.dateOfBirth.day
  const month = request.session.data.dateOfBirth.month
  const year = request.session.data.dateOfBirth.year

  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect('/prototype_v2/eligibility-what-is-your-date-of-birth')
  }

  // Calculate age
  const birthDate = new Date(year, month - 1, day) // month is 0-indexed
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // Check age eligibility (55-74 for lung health checks)
  if (age < 55 || age > 74) {
    return response.redirect('/prototype_v2/drop-out-age')
  }

  // If eligible, show the smoking question page
  response.render('prototype_v2/check-if-you-need-face-to-face-appointment')
})

router.post('/prototype_v2/whatDidYouSmokeAnswer', (request, response) => {
  let selectedTobacco = request.session.data.whatDidSmoke

  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : []
  }

  // Define page mapping for former smokers (same pages, different route name)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ]

  // Create queue of pages to visit
  const pagesToVisit = []
  tobaccoPages.forEach(function (tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page)
    }
  })

  // Store the queue in session
  request.session.data.tobaccoPageQueue = pagesToVisit
  request.session.data.currentTobaccoPageIndex = 0

  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0])
  } else {
    response.redirect('/prototype_v2/check-your-answers')
  }
})

router.post('/prototype_v2/tobacco-next', (request, response) => {
  const queue = request.session.data.tobaccoPageQueue || []
  let currentIndex = request.session.data.currentTobaccoPageIndex || 0

  // Move to next page
  currentIndex++
  request.session.data.currentTobaccoPageIndex = currentIndex

  // Check if more pages in queue
  if (currentIndex < queue.length) {
    response.redirect('/prototype_v2/' + queue[currentIndex])
  } else {
    // All tobacco pages completed, go to check answers
    response.redirect('/prototype_v2/check-your-answers')
  }
})

router.post('/prototype_v2/ageStartedSmokingAnswer', (request, response) => {
  const smokedRegularly = request.session.data.smokedRegularly

  if (smokedRegularly == 'Yes-currently') {
    response.redirect('/prototype_v2/have-you-ever-stopped-smoking')
  } else if (smokedRegularly == 'Yes-usedToRegularly') {
    response.redirect('/prototype_v2/former-smoker-when-quit-smoking')
  } else {
    // Fallback
    response.redirect('/prototype_v2/how-old-when-started-smoking')
  }
})

router.post('/prototype_v2/tobaccoHookahSessionAnswer', (request, response) => {
  let hookahSession = request.session.data.hookahSession

  // If hookahSession is a string (single selection), convert to array
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }

  // Check what was selected and route accordingly
  if (hookahSession && hookahSession.includes('In a group session') && hookahSession.includes('By myself')) {
    // Both selected - go to group first, then individual
    response.redirect('/prototype_v2/tobacco-hookah-how-much-group')
  } else if (hookahSession && hookahSession.includes('In a group session')) {
    // Only group selected
    response.redirect('/prototype_v2/tobacco-hookah-how-much-group')
  } else if (hookahSession && hookahSession.includes('By myself')) {
    // Only individual selected
    response.redirect('/prototype_v2/tobacco-how-much-by-yourself')
  } else {
    // Nothing selected or error - continue to next tobacco type
    response.redirect('/prototype_v2/tobacco-next')
  }
})

router.post('/prototype_v2/tobaccoHookahGroupToIndividual', (request, response) => {
  let hookahSession = request.session.data.hookahSession

  // Convert to array if needed
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }

  // If both were selected and user just completed group, go to individual
  if (hookahSession && hookahSession.includes('By myself')) {
    response.redirect('/prototype_v2/tobacco-how-much-by-yourself')
  } else {
    // Otherwise continue to next tobacco type
    response.redirect('/prototype_v2/tobacco-next')
  }
})
module.exports = router
