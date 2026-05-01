// External dependencies
const express = require('express')
const router = express.Router()

/////////////////
// Prototype 3 //
/////////////////

// ============================================
// START AND LOGIN FLOW
// ============================================

router.get('/prototype_v3/start-journey', function (request, response) {
  delete request.session.data
  response.redirect("/prototype_v3/login")
})

router.post('/prototype_v3/login', function (request, response) {
  request.session.data['logged-in'] = true
  response.redirect('/prototype_v3/enter-the-security-code')
})

router.post('/prototype_v3/enter-the-security-code', function (_request, response) {
  response.redirect('/prototype_v3/agree-to-share-login-info')
})

router.post('/prototype_v3/agree-to-share-login-info', function (_request, response) {
  response.redirect('/prototype_v3/accept-terms')
})

// Show accept terms page (GET request clears any error state)
router.get('/prototype_v3/accept-terms', function (request, response) {
  // Clear any previous error state
  delete request.session.data['accept-terms-error']
  response.render('prototype_v3/accept-terms')
})

// Accept terms validation (POST)
router.post('/prototype_v3/accept-terms', function (request, response) {
  const acceptTerms = request.session.data['accept-terms']

  // Check if acceptTerms is an array containing 'yes' or if it's the string 'yes'
  const isAccepted = (Array.isArray(acceptTerms) && acceptTerms.includes('yes')) || acceptTerms === 'yes'

  if (!isAccepted) {
    // Checkbox not ticked - show error
    request.session.data['accept-terms-error'] = true
    response.redirect('/prototype_v3/accept-terms')
  } else {
    // Checkbox ticked - clear error and continue to next page
    delete request.session.data['accept-terms-error']
    response.redirect('/prototype_v3/have-you-completed-by-phone')
  }
})

// ============================================
// INITIAL ELIGIBILITY CHECKS
// ============================================

router.post('/prototype_v3/have-you-completed-by-phone-answer', function(request, response) {
  const completedByPhone = request.session.data['completedByPhone']

  if (completedByPhone === 'Yes') {
    response.redirect('/prototype_v3/completed-by-phone-exit')
  } else if (completedByPhone === 'No') {
    response.redirect('/prototype_v3/eligibility-have-you-ever-smoked')
  } else {
    response.redirect('/prototype_v3/have-you-completed-by-phone')
  }
})

router.post('/prototype_v3/smokedRegularlyAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']

  // People who never smoked or smoked very little should be dropped out immediately
  if (smokedRegularly === "Yes-usedToFewTimes"){
    return response.redirect("/prototype_v3/drop-out-never-smoked")
  }

  if (smokedRegularly === "No"){
    return response.redirect("/prototype_v3/drop-out-never-smoked")
  }

  // People who currently smoke or used to smoke need to check age eligibility
  if (smokedRegularly === "Yes-currently"){
    return response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  }

  if (smokedRegularly === "Yes-usedToRegularly"){
    return response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  }

  // If no match, redirect back to the form
  return response.redirect("/prototype_v3/eligibility-have-you-ever-smoked")
})

router.post('/prototype_v3/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month']
  const year = request.session.data['dateOfBirth']['year']

  if (!day || !month || !year) {
    return response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  }

  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  if (age < 55 || age > 74) {
    return response.redirect("/prototype_v3/drop-out-age")
  }

  response.render('prototype_v3/check-if-you-need-face-to-face-appointment')
})

router.post('/prototype_v3/who-should-not-use-answer', function(request, response) {
  var canContinue = request.session.data['canYouContinue']

  if (canContinue == "Yes"){
    response.redirect("/prototype_v3/drop-out-bmi")
  } else if (canContinue == "No"){
    response.redirect("/prototype_v3/enter-your-height")
  } else {
    response.redirect("/prototype_v3/who-should-not-use-this-online-service")
  }
})

// ============================================
// HEIGHT AND WEIGHT VALIDATION
// ============================================

router.post('/prototype_v3/enter-your-height-answer', function(request, response) {
  var heightUnit = request.session.data['heightUnit']
  var height = request.session.data['height']
  var errors = {}

  // Clear previous errors
  delete request.session.data['heightErrors']

  if (heightUnit == "imperial") {
    var feet = height ? height.feet : ''
    var inches = height ? height.inches : ''

    // Check if both fields are empty
    if (!feet && !inches) {
      errors.height = "Enter your height"
    } else {
      // Validate feet
      if (feet) {
        if (feet.includes('.') || feet.includes(',')) {
          errors.feet = "Feet must be in whole numbers"
        } else if (isNaN(feet) || feet < 4 || feet > 8) {
          errors.feet = "Feet must be between 4 and 8"
        }
      }

      // Validate inches
      if (inches) {
        if (inches.includes('.') || inches.includes(',')) {
          errors.inches = "Inches must be in whole numbers"
        } else if (isNaN(inches) || inches < 0 || inches > 11) {
          errors.inches = "Inches must be between 0 and 11"
        }
      }

      // If individual validations pass, check total range
      if (!errors.feet && !errors.inches && feet && inches) {
        var totalInches = (parseInt(feet) * 12) + parseInt(inches)
        if (totalInches < 55 || totalInches > 96) {
          errors.height = "Height must be between 4 feet 7 inches and 8 feet"
        }
      }
    }
  } else {
    // Metric validation
    var centimetres = height ? height.centimetres : ''

    if (!centimetres) {
      errors.height = "Enter your height"
    } else if (isNaN(centimetres) || centimetres < 139.7 || centimetres > 243.8) {
      errors.height = "Height must be between 139.7cm and 243.8 cm"
    }
  }

  // If there are errors, store them and redirect back
  if (Object.keys(errors).length > 0) {
    request.session.data['heightErrors'] = errors
    response.redirect("/prototype_v3/enter-your-height")
  } else {
    // No errors, continue to weight page
    response.redirect("/prototype_v3/enter-your-weight")
  }
})

router.post('/prototype_v3/enter-your-weight-answer', function(request, response) {
  var weightUnit = request.session.data['weightUnit']
  var weight = request.session.data['weight']
  var errors = {}

  // Clear previous errors
  delete request.session.data['weightErrors']

  if (weightUnit == "imperial") {
    var stone = weight ? weight.stone : ''
    var pounds = weight ? weight.pounds : ''

    // Check if both fields are empty
    if (!stone && !pounds) {
      errors.weight = "Enter your weight"
    } else {
      // Validate stone
      if (stone) {
        if (stone.includes('.') || stone.includes(',')) {
          errors.stone = "Stone must be in whole numbers"
        }
      }

      // Validate pounds
      if (pounds) {
        if (pounds.includes('.') || pounds.includes(',')) {
          errors.pounds = "Pounds must be in whole numbers"
        } else if (isNaN(pounds) || pounds < 0 || pounds > 13) {
          errors.pounds = "Pounds must be between 0 and 13"
        }
      }

      // If individual validations pass, check total range
      if (!errors.stone && !errors.pounds && stone && pounds) {
        var totalPounds = (parseInt(stone) * 14) + parseInt(pounds)
        if (totalPounds < 56 || totalPounds > 700) {
          errors.weight = "Weight must be between 4 stone and 50 stone"
        }
      }
    }
  } else {
    // Metric validation
    var kilograms = weight ? weight.kilograms : ''

    if (!kilograms) {
      errors.weight = "Enter your weight"
    } else if (isNaN(kilograms) || kilograms < 25.4 || kilograms > 317.5) {
      errors.weight = "Weight must be between 25.4kg and 317.5kg"
    }
  }

  // If there are errors, store them and redirect back
  if (Object.keys(errors).length > 0) {
    request.session.data['weightErrors'] = errors
    response.redirect("/prototype_v3/enter-your-weight")
  } else {
    // No errors, continue to sex page
    response.redirect("/prototype_v3/your-gender-identity")
  }
})

// ============================================
// MEDICAL HISTORY
// ============================================
router.post('/prototype_v3/diagnosed-with-cancer-answer', function(request, response) {
  response.redirect("/prototype_v3/relatives-with-cancer")
})

router.post('/prototype_v3/relatives-with-cancer-answer', function(request, response) {
  var relativesHaveCancer = request.session.data['relativesHaveCancer']

  if (relativesHaveCancer == "Yes"){
    response.redirect("/prototype_v3/relatives-age-when-diagnosed")
  } else if (relativesHaveCancer == "No" || relativesHaveCancer == "I don't know"){
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  } else {
    response.redirect("/prototype_v3/relatives-with-cancer")
  }
})

router.post('/prototype_v3/relatives-age-answer', function(request, response) {
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})



// ============================================
// ROUTING FOR PERIODS WHEN YOU STOPPED SMOKING
// ============================================

// GET route for "Periods when you stopped smoking" page (for index testing)
// Sets smokedRegularly from query parameter if provided
router.get('/prototype_v3/periods-when-you-stopped-smoking', function(request, response, next) {
  if (request.query.smokedRegularly) {
    request.session.data['smokedRegularly'] = request.query.smokedRegularly
  }
  next()
})

// Route handler for "How old when started smoking" page
// This sends current smokers to "periods when stopped" and former smokers to "when quit"
router.post('/prototype_v3/how-old-when-started-smoking-answer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']

  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v3/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  }
})

// Route handler for "Former smoker when quit" page
// This sends former smokers to "periods when stopped"
router.post('/prototype_v3/former-smoker-when-quit-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
})

// Route handler for "Periods when you stopped smoking" page
// This sends everyone to the tobacco selection page
router.post('/prototype_v3/periods-when-you-stopped-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/what-do-or-did-smoke")
})


// ============================================
// HELPER FUNCTIONS
// ============================================

function moveToNextTobaccoType(request, response) {
  var tobaccoQueue = request.session.data['tobaccoQueue'] || []
  var currentIndex = request.session.data['tobaccoQueueIndex'] || 0

  currentIndex++
  request.session.data['tobaccoQueueIndex'] = currentIndex

  if (currentIndex < tobaccoQueue.length) {
    response.redirect(tobaccoQueue[currentIndex])
  } else {
    response.redirect('/prototype_v3/check-your-answers')
  }
}

// CIGAR SIZE SPLIT: moveToNextCigarSize is no longer used — cigar sizes now go through moveToNextTobaccoType.
// To revert: restore this function and replace moveToNextTobaccoType calls in the cigars section with it.
/*
function moveToNextCigarSize(request, response, smokerType) {
  var sizeQueue = request.session.data['cigarSizeQueue'] || []
  var currentIndex = request.session.data['cigarSizeQueueIndex'] || 0
  var currentSize = request.session.data['currentCigarSize']

  if (currentSize) {
    delete request.session.data['cigar' + currentSize + 'Changes']
  }

  currentIndex++
  request.session.data['cigarSizeQueueIndex'] = currentIndex

  if (currentIndex < sizeQueue.length) {
    request.session.data['currentCigarSize'] = sizeQueue[currentIndex]
    response.redirect('/prototype_v3/tobacco/cigars/' + smokerType + '/quantity')
  } else {
    delete request.session.data['cigarSizeQueue']
    delete request.session.data['cigarSizeQueueIndex']
    delete request.session.data['currentCigarSize']
    moveToNextTobaccoType(request, response)
  }
}
*/

// ============================================
// TOBACCO TYPE SELECTION
// ============================================

// GET route for "What do or did you smoke" page (for index testing)
// Sets smokedRegularly from query parameter if provided
router.get('/prototype_v3/what-do-or-did-smoke', function(request, response, next) {
  if (request.query.smokedRegularly) {
    request.session.data['smokedRegularly'] = request.query.smokedRegularly
  }
  next()
})

router.post('/prototype_v3/what-do-or-did-smoke-answer', function(request, response) {
  var selectedTobacco = request.session.data['tobaccoTypes']
  var smokedRegularly = request.session.data['smokedRegularly']

  // Ensure it's an array
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : []
  }

  const tobaccoRoutes = {
    'Cigarettes': '/prototype_v3/tobacco/cigarettes',
    'Rolling tobacco': '/prototype_v3/tobacco/rolling-tobacco',
    'Pipe': '/prototype_v3/tobacco/pipe',
    // CIGAR SIZE SPLIT - see MEMORY.md
    'Small cigars': '/prototype_v3/tobacco/cigars/Small',
    'Medium cigars': '/prototype_v3/tobacco/cigars/Medium',
    'Large cigars': '/prototype_v3/tobacco/cigars/Large',
    'Cigarillos': '/prototype_v3/tobacco/cigarillos',
    'Shisha': '/prototype_v3/tobacco/shisha'
  }

  var tobaccoQueue = []
  var tobaccoOrder = ['Cigarettes', 'Rolling tobacco', 'Pipe', 'Small cigars', 'Medium cigars', 'Large cigars', 'Cigarillos', 'Shisha']

  // Check if user selected multiple tobacco types
  var multipleTypes = selectedTobacco.length > 1

  tobaccoOrder.forEach(function(type) {
    if (selectedTobacco.includes(type)) {
      if (smokedRegularly === "Yes-currently") {
        if (multipleTypes) {
          // Multiple types - need to ask which ones they currently smoke
          tobaccoQueue.push(tobaccoRoutes[type] + '/do-you-currently-smoke')
        } else {
          // Single type and they're a current smoker
          if (type === 'Shisha') {
            // Shisha doesn't have frequency and years-smoked is only for multiple types
            // Go directly to group-or-alone
            tobaccoQueue.push(tobaccoRoutes[type] + '/current/group-or-alone')
          } else {
            // Other types go straight to frequency (skip years-smoked)
            tobaccoQueue.push(tobaccoRoutes[type] + '/current/frequency')
          }
        }
      } else if (smokedRegularly === "Yes-usedToRegularly") {
        if (multipleTypes) {
          // Multiple types - go to years-smoked first
          tobaccoQueue.push(tobaccoRoutes[type] + '/former/years-smoked')
        } else {
          // Single type and they're a former smoker
          if (type === 'Shisha') {
            // Shisha doesn't have frequency and years-smoked is only for multiple types
            // Go directly to group-or-alone
            tobaccoQueue.push(tobaccoRoutes[type] + '/former/group-or-alone')
          } else {
            // Other types go straight to frequency (skip years-smoked)
            tobaccoQueue.push(tobaccoRoutes[type] + '/former/frequency')
          }
        }
      }
    }
  })

  request.session.data['tobaccoQueue'] = tobaccoQueue
  request.session.data['tobaccoQueueIndex'] = 0

  if (tobaccoQueue.length > 0) {
    response.redirect(tobaccoQueue[0])
  } else {
    response.redirect('/prototype_v3/check-your-answers')
  }
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARETTES
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarettes = request.session.data['currentlySmokesCigarettes']

  if (currentlySmokesCigarettes === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/years-smoked')
  }
})

// ============================================
// CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/current/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-answer', function(request, response) {
  var quantity = request.session.data['cigarettesCurrentQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['cigarettesCurrentQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity')
  }

  // Clear any previous errors
  delete request.session.data['cigarettesCurrentQuantity-error']

  response.redirect('/prototype_v3/tobacco/cigarettes/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarettes/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigarettes/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigarettes/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/former/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-answer', function(request, response) {
  var quantity = request.session.data['cigarettesFormerQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['cigarettesFormerQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity')
  }

  // Clear any previous errors
  delete request.session.data['cigarettesFormerQuantity-error']

  response.redirect('/prototype_v3/tobacco/cigarettes/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarettes/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - ROLLED CIGARETTES
// ============================================

router.post('/prototype_v3/tobacco/rolling-tobacco/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesRollingTobacco = request.session.data['currentlySmokesRollingTobacco']

  if (currentlySmokesRollingTobacco === 'Yes') {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/years-smoked')
  }
})

// ============================================
// ROLLED CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/rolling-tobacco/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/frequency')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/rolling-tobacco/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/more-quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/more-duration')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/rolling-tobacco/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/less-quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/current/less-duration')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// ROLLED CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/rolling-tobacco/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/frequency')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/rolling-tobacco/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/more-quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/more-duration')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/rolling-tobacco/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/less-quantity')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolling-tobacco/former/less-duration')
})

router.post('/prototype_v3/tobacco/rolling-tobacco/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['rollingTobaccoFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - PIPE
// ============================================

router.post('/prototype_v3/tobacco/pipe/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesPipe = request.session.data['currentlySmokesPipe']

  if (currentlySmokesPipe === 'Yes') {
    response.redirect('/prototype_v3/tobacco/pipe/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/pipe/former/years-smoked')
  }
})

// ============================================
// PIPE ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/pipe/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/frequency')
})

router.post('/prototype_v3/tobacco/pipe/current/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/quantity')
})

router.post('/prototype_v3/tobacco/pipe/current/quantity-answer', function(request, response) {
  var quantity = request.session.data['pipeCurrentQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['pipeCurrentQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/pipe/current/quantity')
  }

  // Clear any previous errors
  delete request.session.data['pipeCurrentQuantity-error']

  response.redirect('/prototype_v3/tobacco/pipe/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/pipe/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/pipe/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/more-quantity')
})

router.post('/prototype_v3/tobacco/pipe/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/more-duration')
})

router.post('/prototype_v3/tobacco/pipe/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/pipe/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/less-quantity')
})

router.post('/prototype_v3/tobacco/pipe/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/less-duration')
})

router.post('/prototype_v3/tobacco/pipe/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// PIPE ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/pipe/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/frequency')
})

router.post('/prototype_v3/tobacco/pipe/former/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/quantity')
})

router.post('/prototype_v3/tobacco/pipe/former/quantity-answer', function(request, response) {
  var quantity = request.session.data['pipeFormerQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['pipeFormerQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/pipe/former/quantity')
  }

  // Clear any previous errors
  delete request.session.data['pipeFormerQuantity-error']

  response.redirect('/prototype_v3/tobacco/pipe/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/pipe/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/pipe/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/more-quantity')
})

router.post('/prototype_v3/tobacco/pipe/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/more-duration')
})

router.post('/prototype_v3/tobacco/pipe/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/pipe/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/less-quantity')
})

router.post('/prototype_v3/tobacco/pipe/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/less-duration')
})

router.post('/prototype_v3/tobacco/pipe/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// CIGAR SIZE ENTRY ROUTES - CIGAR SIZE SPLIT (see MEMORY.md)
// These set currentCigarSize in session before redirecting to the shared cigar pages.
// ============================================

var cigarSizes = ['Small', 'Medium', 'Large']

cigarSizes.forEach(function(size) {
  // Multiple types, current smoker: do-you-currently-smoke
  router.get('/prototype_v3/tobacco/cigars/' + size + '/do-you-currently-smoke', function(request, response) {
    request.session.data['currentCigarSize'] = size
    response.redirect('/prototype_v3/tobacco/cigars/do-you-currently-smoke')
  })

  // Single type, current smoker: go direct to frequency
  router.get('/prototype_v3/tobacco/cigars/' + size + '/current/frequency', function(request, response) {
    request.session.data['currentCigarSize'] = size
    response.redirect('/prototype_v3/tobacco/cigars/current/frequency')
  })

  // Multiple types, former smoker: years-smoked
  router.get('/prototype_v3/tobacco/cigars/' + size + '/former/years-smoked', function(request, response) {
    request.session.data['currentCigarSize'] = size
    response.redirect('/prototype_v3/tobacco/cigars/former/years-smoked')
  })

  // Single type, former smoker: go direct to frequency
  router.get('/prototype_v3/tobacco/cigars/' + size + '/former/frequency', function(request, response) {
    request.session.data['currentCigarSize'] = size
    response.redirect('/prototype_v3/tobacco/cigars/former/frequency')
  })
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARS
// ============================================

router.post('/prototype_v3/tobacco/cigars/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigars = request.session.data['currentlySmokesCigars']

  if (currentlySmokesCigars === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigars/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigars/former/years-smoked')
  }
})

// ============================================
// CIGARS ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigars/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/frequency')
})

router.post('/prototype_v3/tobacco/cigars/current/frequency-answer', function(request, response) {
  // CIGAR SIZE SPLIT: copies frequency to size-specific variable, skips cigar-size page (see MEMORY.md)
  var currentSize = request.session.data['currentCigarSize']
  request.session.data['cigar' + currentSize + 'Frequency'] = request.session.data['cigarsCurrentFrequency']
  response.redirect('/prototype_v3/tobacco/cigars/current/quantity')
})

// cigar-size-answer not used - CIGAR SIZE SPLIT (see MEMORY.md)
// router.post('/prototype_v3/tobacco/cigars/current/cigar-size-answer', ...)

router.post('/prototype_v3/tobacco/cigars/current/quantity-answer', function(request, response) {
  var currentSize = request.session.data['currentCigarSize']
  var fieldName = 'cigar' + currentSize + 'Quantity'
  var quantity = request.session.data[fieldName]

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data[fieldName + '-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigars/current/quantity')
  }

  // Clear any previous errors
  delete request.session.data[fieldName + '-error']

  response.redirect('/prototype_v3/tobacco/cigars/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigars/current/has-quantity-changed-answer', function(request, response) {
  var currentSize = request.session.data['currentCigarSize']
  var changes = request.session.data['cigar' + currentSize + 'Changes']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/less-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigars/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigars/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigars/current/more-duration-answer', function(request, response) {
  var currentSize = request.session.data['currentCigarSize']
  var changes = request.session.data['cigar' + currentSize + 'Changes']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/less-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigars/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigars/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigars/current/less-duration-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARS ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigars/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/frequency')
})

router.post('/prototype_v3/tobacco/cigars/former/frequency-answer', function(request, response) {
  // CIGAR SIZE SPLIT: copies frequency to size-specific variable, skips cigar-size page (see MEMORY.md)
  var currentSize = request.session.data['currentCigarSize']
  request.session.data['cigar' + currentSize + 'Frequency'] = request.session.data['cigarsFormerFrequency']
  response.redirect('/prototype_v3/tobacco/cigars/former/quantity')
})

// cigar-size-answer not used - CIGAR SIZE SPLIT (see MEMORY.md)
// router.post('/prototype_v3/tobacco/cigars/former/cigar-size-answer', ...)

router.post('/prototype_v3/tobacco/cigars/former/quantity-answer', function(request, response) {
  var currentSize = request.session.data['currentCigarSize']
  var fieldName = 'cigar' + currentSize + 'Quantity'
  var quantity = request.session.data[fieldName]

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data[fieldName + '-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigars/former/quantity')
  }

  // Clear any previous errors
  delete request.session.data[fieldName + '-error']

  response.redirect('/prototype_v3/tobacco/cigars/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigars/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarsFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/less-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigars/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigars/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigars/former/more-duration-answer', function(request, response) {
  var currentSize = request.session.data['currentCigarSize']
  var changes = request.session.data['cigar' + currentSize + 'Changes']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/less-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigars/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigars/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigars/former/less-duration-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARILLOS
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarillos = request.session.data['currentlySmokesCigarillos']

  if (currentlySmokesCigarillos === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/years-smoked')
  }
})

// ============================================
// CIGARILLOS ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/frequency')
})

router.post('/prototype_v3/tobacco/cigarillos/current/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/current/quantity-answer', function(request, response) {
  var quantity = request.session.data['cigarillosCurrentQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['cigarillosCurrentQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigarillos/current/quantity')
  }

  // Clear any previous errors
  delete request.session.data['cigarillosCurrentQuantity-error']

  response.redirect('/prototype_v3/tobacco/cigarillos/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarillos/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigarillos/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigarillos/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// CIGARILLOS ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/frequency')
})

router.post('/prototype_v3/tobacco/cigarillos/former/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/former/quantity-answer', function(request, response) {
  var quantity = request.session.data['cigarillosFormerQuantity']

  // Validate that quantity is at least 1
  if (!quantity || parseInt(quantity) < 1) {
    request.session.data['cigarillosFormerQuantity-error'] = true
    return response.redirect('/prototype_v3/tobacco/cigarillos/former/quantity')
  }

  // Clear any previous errors
  delete request.session.data['cigarillosFormerQuantity-error']

  response.redirect('/prototype_v3/tobacco/cigarillos/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarillos/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigarillos/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/less-frequency')
  } else if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigarillos/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']

  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }

  if (changes.includes('stopped')) {
    moveToNextTobaccoType(request, response)
  } else {
    moveToNextTobaccoType(request, response)
  }
})


// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - SHISHA
// ============================================

router.post('/prototype_v3/tobacco/shisha/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesShisha = request.session.data['currentlySmokesShisha']

  if (currentlySmokesShisha === 'Yes') {
    response.redirect('/prototype_v3/tobacco/shisha/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/years-smoked')
  }
})

// ============================================
// SHISHA ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/shisha/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/current/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']

  // Convert to array if it's not already (handles single selection)
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = [groupOrAlone]
  }

  // Check if both are selected
  var hasGroup = groupOrAlone.includes('Group')
  var hasAlone = groupOrAlone.includes('Alone')

  if (hasGroup && hasAlone) {
    // Both selected - go to group questions first, then alone
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  } else if (hasGroup) {
    // Only group selected
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  } else if (hasAlone) {
    // Only alone selected
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  }
})

// GROUP flow
router.post('/prototype_v3/tobacco/shisha/current/group-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity')
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']

  // Convert to array if it's not already
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = [groupOrAlone]
  }

  // If they smoke both group and alone, now ask about alone
  if (groupOrAlone.includes('Group') && groupOrAlone.includes('Alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// ALONE flow
router.post('/prototype_v3/tobacco/shisha/current/alone-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity')
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// SHISHA ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/shisha/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/former/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']

  // Convert to array if it's not already (handles single selection)
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = [groupOrAlone]
  }

  // Check if both are selected
  var hasGroup = groupOrAlone.includes('Group')
  var hasAlone = groupOrAlone.includes('Alone')

  if (hasGroup && hasAlone) {
    // Both selected - go to group questions first, then alone
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  } else if (hasGroup) {
    // Only group selected
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  } else if (hasAlone) {
    // Only alone selected
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  }
})

// GROUP flow - FORMER
router.post('/prototype_v3/tobacco/shisha/former/group-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity')
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']

  // Convert to array if it's not already
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = [groupOrAlone]
  }

  // If they smoked both group and alone, now ask about alone
  if (groupOrAlone.includes('Group') && groupOrAlone.includes('Alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// ALONE flow - FORMER
router.post('/prototype_v3/tobacco/shisha/former/alone-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity')
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// INDEX-ALLPAGES - Clear all session data
// ============================================

router.get('/prototype_v3/index-allpages', function(request, response) {
  // Clear ALL session data
  request.session.data = {}

  // Render the page
  response.render('prototype_v3/index-allpages')
})

// ============================================
// CHECK YOUR ANSWERS - Calculate years smoked
// ============================================

router.get('/prototype_v3/check-your-answers', function(request, response) {
  // Calculate years smoked if not explicitly entered
  var currentYear = new Date().getFullYear()
  var birthYear = request.session.data['dateOfBirth'] && request.session.data['dateOfBirth']['year']
    ? parseInt(request.session.data['dateOfBirth']['year'])
    : 0
  var currentAge = birthYear > 0 ? currentYear - birthYear : 0
  var ageStarted = request.session.data['ageStartedSmoking']
    ? parseInt(request.session.data['ageStartedSmoking'])
    : 0
  var periodsStopped = request.session.data['totalYearsStoppedSmoking']
    ? parseInt(request.session.data['totalYearsStoppedSmoking'])
    : 0
  var ageQuit = request.session.data['formerSmokingQuitDate'] && request.session.data['formerSmokingQuitDate']['age']
    ? parseInt(request.session.data['formerSmokingQuitDate']['age'])
    : 0

  // Calculate based on smoker type
  var calculatedYears = 0
  if (request.session.data['smokedRegularly'] === 'Yes-currently') {
    calculatedYears = currentAge > 0 && ageStarted > 0 ? currentAge - ageStarted - periodsStopped : 0
  } else if (request.session.data['smokedRegularly'] === 'Yes-usedToRegularly') {
    calculatedYears = ageQuit > 0 && ageStarted > 0 ? ageQuit - ageStarted - periodsStopped : 0
  }

  // Ensure non-negative
  calculatedYears = Math.max(0, calculatedYears)

  // Only set calculated value for tobacco types that were actually selected
  var selectedTobaccoTypes = request.session.data['tobaccoTypes'] || []

  // Ensure it's an array
  if (!Array.isArray(selectedTobaccoTypes)) {
    selectedTobaccoTypes = selectedTobaccoTypes ? [selectedTobaccoTypes] : []
  }

  var isCurrent = request.session.data['smokedRegularly'] === 'Yes-currently'

  // Map tobacco type names to their data field names
  var tobaccoTypeMapping = {
    'Cigarettes': isCurrent ? 'cigarettesCurrentYearsSmoked' : 'cigarettesFormerYearsSmoked',
    'Rolling tobacco': isCurrent ? 'rollingTobaccoCurrentYearsSmoked' : 'rollingTobaccoFormerYearsSmoked',
    'Pipe': isCurrent ? 'pipeCurrentYearsSmoked' : 'pipeFormerYearsSmoked',
    'Small cigars': isCurrent ? 'cigarsCurrentYearsSmoked' : 'cigarsFormerYearsSmoked',
    'Medium cigars': isCurrent ? 'cigarsCurrentYearsSmoked' : 'cigarsFormerYearsSmoked',
    'Large cigars': isCurrent ? 'cigarsCurrentYearsSmoked' : 'cigarsFormerYearsSmoked',
    'Cigarillos': isCurrent ? 'cigarillosCurrentYearsSmoked' : 'cigarillosFormerYearsSmoked',
    'Shisha': isCurrent ? 'shishaCurrentYearsSmoked' : 'shishaFormerYearsSmoked'
  }

  // Only set years for selected tobacco types
  selectedTobaccoTypes.forEach(function(tobaccoType) {
    var fieldName = tobaccoTypeMapping[tobaccoType]
    if (fieldName && !request.session.data[fieldName] && calculatedYears > 0) {
      request.session.data[fieldName] = calculatedYears
    }
  })

  // Render the page
  response.render('prototype_v3/check-your-answers')
})

// ============================================
// SKIP TO TOBACCO SECTION - CURRENT (FOR TESTING)
// ============================================

router.get('/prototype_v3/skip-to-tobacco', function(request, response) {
  // CLEAR ALL SESSION DATA
  request.session.data = {}

  // NOW SET THE PRE-FILLED DATA FOR TESTING
  request.session.data['smokedRegularly'] = "Yes-currently"

  // Date of birth
  request.session.data['dateOfBirth'] = {
    day: "19",
    month: "06",
    year: "1965"
  }

  // About you section
  request.session.data['height'] = {
    feet: "5",
    inches: "10"
  }
  request.session.data['weight'] = {
    kilograms: "80"
  }
  request.session.data['whatIsYourSex'] = "Male"
  request.session.data['bestDescribe'] = "Male"
  request.session.data['ethnicBackground'] = "White"
  request.session.data['educationCompleted'] = "Bachelors degree"

  // Your health section
  request.session.data['EverDiagnosedWith'] = ["Pneumonia"]
  request.session.data['exposedAsbestos'] = "No"
  request.session.data['livedWithAsbestosWorker'] = "No"
  request.session.data['diagnosedCancer'] = "No"

  // Family history
  request.session.data['relativesHaveCancer'] = "Yes"
  request.session.data['relativeAge'] = "Yes"

  // Redirect to how-old-when-started-smoking with clean slate
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})

// ============================================
// SKIP TO TOBACCO SECTION (FORMER SMOKER)
// ============================================

router.get('/prototype_v3/skip-to-tobacco-former', function(request, response) {
  // CLEAR ALL SESSION DATA
  request.session.data = {}

  // NOW SET THE PRE-FILLED DATA FOR TESTING
  request.session.data['smokedRegularly'] = "Yes-usedToRegularly"

  // Date of birth
  request.session.data['dateOfBirth'] = {
    day: "19",
    month: "06",
    year: "1965"
  }

  // About you section
  request.session.data['height'] = {
    feet: "5",
    inches: "10"
  }
  request.session.data['weight'] = {
    kilograms: "80"
  }
  request.session.data['whatIsYourSex'] = "Male"
  request.session.data['bestDescribe'] = "Male"
  request.session.data['ethnicBackground'] = "White"
  request.session.data['educationCompleted'] = "Bachelors degree"

  // Your health section
  request.session.data['EverDiagnosedWith'] = ["Pneumonia"]
  request.session.data['exposedAsbestos'] = "No"
  request.session.data['livedWithAsbestosWorker'] = "No"
  request.session.data['diagnosedCancer'] = "No"

  // Family history
  request.session.data['relativesHaveCancer'] = "Yes"
  request.session.data['relativeAge'] = "Yes"

  // Redirect to how-old-when-started-smoking with clean slate
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})

module.exports = router
