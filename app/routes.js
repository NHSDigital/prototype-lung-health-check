// External dependencies
const express = require('express');

const router = express.Router();

// Add your routes here - above the module.exports line

module.exports = router;

router.post('/prototype_v1/relatives-with-cancer-answer', function(request, response) {
var relativesHaveCancer = request.session.data['relativesHaveCancer']
var smokedRegularly = request.session.data['smokedRegularly']

if (relativesHaveCancer == "Yes"){
  // If relatives had cancer, ask about their age first
  response.redirect("/prototype_v1/relatives-age-when-diagnosed")
} else if (relativesHaveCancer == "No"){
  // No relatives with cancer, route based on smoking status
 if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
  } else {
    // Fallback to original logic if smoking status unclear
    response.redirect("/prototype_v1/do-you-smoke-now")
  }
} else {
  response.redirect("/prototype_v1/relatives-with-cancer")
}
})


router.post('/prototype_v1/relatives-age-answer', function(request, response) {
var smokedRegularly = request.session.data['smokedRegularly']

if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else {
  // Fallback
  response.redirect("/prototype_v1/do-you-smoke-now")
}
})

router.get('/prototype_v1/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v1/eligibility-have-you-ever-smoked")
})

router.post('/prototype_v1/smokedRegularlyAnswer', function(request, response) {
    var smokedRegularly = request.session.data['smokedRegularly']
    if (smokedRegularly == "Yes-currently"){
        response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToRegularly"){
        response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToFewTimes"){
        response.redirect("/prototype_v1/drop-out-never-smoked") 
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v1/drop-out-never-smoked")
    }
    else {
        response.redirect("/prototype_v1/eligibility-have-you-ever-smoked")
    }
})

router.post('/prototype_v1/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/current-smoker-how-many-years")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/former-smoker-when-quit-smoking")
    } else {
        response.redirect("/prototype_v1/do-you-smoke-now")
    }
})

router.post('/prototype_v1/who-should-not-use-answer', function(request, response) {
    var smokeNow = request.session.data['canYouContinue']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/what-is-your-height")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/drop-out-bmi")
    } else {
        response.redirect("/prototype_v1/who-should-not-use-this-online-service")
    }
})

router.post('/prototype_v1/whatDoYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatSmokeNow'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping in order (matches checkbox order)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v1/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v1/check-your-answers');
  }
})

router.post('/prototype_v1/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
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
    return response.redirect("/prototype_v1/drop-out-age")
  }
  
  // If eligible, show the smoking question page
  response.render('prototype_v1/task-list')
})

router.post('/prototype_v1/whatDidYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatDidSmoke'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping for former smokers (same pages, different route name)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v1/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v1/check-your-answers');
  }
})

router.post('/prototype_v1/tobacco-next', function(request, response) {
  var queue = request.session.data['tobaccoPageQueue'] || [];
  var currentIndex = request.session.data['currentTobaccoPageIndex'] || 0;
  
  // Move to next page
  currentIndex++;
  request.session.data['currentTobaccoPageIndex'] = currentIndex;
  
  // Check if more pages in queue
  if (currentIndex < queue.length) {
    response.redirect('/prototype_v1/' + queue[currentIndex]);
  } else {
    // All tobacco pages completed, go to check answers
    response.redirect('/prototype_v1/check-your-answers');
  }
})
router.post('/prototype_v1/ageStartedSmokingAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v1/have-you-ever-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v1/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v1/how-old-when-started-smoking")
  }
})


router.post('/prototype_v1/tobaccoHookahSessionAnswer', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // If hookahSession is a string (single selection), convert to array
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // Check what was selected and route accordingly
  if (hookahSession && hookahSession.includes('In a group session') && hookahSession.includes('By myself')) {
    // Both selected - go to group first, then individual
    response.redirect("/prototype_v1/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('In a group session')) {
    // Only group selected
    response.redirect("/prototype_v1/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('By myself')) {
    // Only individual selected
    response.redirect("/prototype_v1/tobacco-how-much-by-yourself")
  } else {
    // Nothing selected or error - continue to next tobacco type
    response.redirect("/prototype_v1/tobacco-next")
  }
})


router.post('/prototype_v1/tobaccoHookahGroupToIndividual', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // Convert to array if needed
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // If both were selected and user just completed group, go to individual
  if (hookahSession && hookahSession.includes('By myself')) {
    response.redirect("/prototype_v1/tobacco-how-much-by-yourself")
  } else {
    // Otherwise continue to next tobacco type
    response.redirect("/prototype_v1/tobacco-next")
  }
})

/////////////////
// Prototype 2 //
/////////////////
/////////////////
/////////////////


router.post('/prototype_v2/relatives-with-cancer-answer', function(request, response) {
var relativesHaveCancer = request.session.data['relativesHaveCancer']

if (relativesHaveCancer == "Yes"){
  // If relatives had cancer, ask about their age first
  response.redirect("/prototype_v2/relatives-age-when-diagnosed")
} else if (relativesHaveCancer == "No" || relativesHaveCancer == "I don't know"){
  // No relatives with cancer OR don't know, go straight to age started smoking
  response.redirect("/prototype_v2/how-old-when-started-smoking")
} else {
  // No answer provided, redirect back to the question
  response.redirect("/prototype_v2/relatives-with-cancer")
}
})

router.post('/prototype_v2/relatives-age-answer', function(request, response) {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
})

router.get('/prototype_v2/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v2/have-you-completed-by-phone")
})

router.post('/prototype_v2/have-you-completed-by-phone-answer', function(request, response) {
  const completedByPhone = request.session.data['completedByPhone']
  
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

router.post('/prototype_v2/smokedRegularlyAnswer', function(request, response) {
    var smokedRegularly = request.session.data['smokedRegularly']
    if (smokedRegularly == "Yes-currently"){
        response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToRegularly"){
        response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToFewTimes"){
        response.redirect("/prototype_v2/drop-out-never-smoked") 
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v2/drop-out-never-smoked")
    }
    else {
        response.redirect("/prototype_v2/eligibility-have-you-ever-smoked")
    }
})

router.post('/prototype_v2/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v2/current-smoker-how-many-years")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v2/former-smoker-when-quit-smoking")
    } else {
        response.redirect("/prototype_v2/do-you-smoke-now")
    }
})

router.post('/prototype_v2/who-should-not-use-answer', function(request, response) {
    var smokeNow = request.session.data['canYouContinue']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v2/drop-out-bmi")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v2/what-is-your-height")
    } else {
        response.redirect("/prototype_v2/who-should-not-use-this-online-service")
    }
})

router.post('/prototype_v2/whatDoYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatSmokeNow'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping in order (matches checkbox order)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
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
    return response.redirect("/prototype_v2/drop-out-age")
  }
  
  // If eligible, show the smoking question page
  response.render('prototype_v2/check-if-you-need-face-to-face-appointment')
})

router.post('/prototype_v2/whatDidYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatDidSmoke'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping for former smokers (same pages, different route name)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/tobacco-next', function(request, response) {
  var queue = request.session.data['tobaccoPageQueue'] || [];
  var currentIndex = request.session.data['currentTobaccoPageIndex'] || 0;
  
  // Move to next page
  currentIndex++;
  request.session.data['currentTobaccoPageIndex'] = currentIndex;
  
  // Check if more pages in queue
  if (currentIndex < queue.length) {
    response.redirect('/prototype_v2/' + queue[currentIndex]);
  } else {
    // All tobacco pages completed, go to check answers
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/ageStartedSmokingAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v2/have-you-ever-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v2/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v2/how-old-when-started-smoking")
  }
})

router.post('/prototype_v2/tobaccoHookahSessionAnswer', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // If hookahSession is a string (single selection), convert to array
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // Check what was selected and route accordingly
  if (hookahSession && hookahSession.includes('In a group session') && hookahSession.includes('By myself')) {
    // Both selected - go to group first, then individual
    response.redirect("/prototype_v2/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('In a group session')) {
    // Only group selected
    response.redirect("/prototype_v2/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('By myself')) {
    // Only individual selected
    response.redirect("/prototype_v2/tobacco-how-much-by-yourself")
  } else {
    // Nothing selected or error - continue to next tobacco type
    response.redirect("/prototype_v2/tobacco-next")
  }
})

router.post('/prototype_v2/tobaccoHookahGroupToIndividual', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // Convert to array if needed
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // If both were selected and user just completed group, go to individual
  if (hookahSession && hookahSession.includes('By myself')) {
    response.redirect("/prototype_v2/tobacco-how-much-by-yourself")
  } else {
    // Otherwise continue to next tobacco type
    response.redirect("/prototype_v2/tobacco-next")
  }
})

/////////////////
// Prototype 3 //
/////////////////

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

router.get('/prototype_v3/start-journey', function (request, response) {
  delete request.session.data
  response.redirect("/prototype_v3/have-you-completed-by-phone")
})

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
  
  if (smokedRegularly == "Yes-currently"){
    response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  } else if (smokedRegularly == "Yes-usedToRegularly"){
    response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  } else if (smokedRegularly == "Yes-usedToFewTimes"){
    response.redirect("/prototype_v3/drop-out-never-smoked") 
  } else if (smokedRegularly == "No"){
    response.redirect("/prototype_v3/drop-out-never-smoked")
  } else {
    response.redirect("/prototype_v3/eligibility-have-you-ever-smoked")
  }
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
    response.redirect("/prototype_v3/what-is-your-height")
  } else {
    response.redirect("/prototype_v3/who-should-not-use-this-online-service")
  }
})

router.post('/prototype_v3/diagnosed-with-cancer-answer', function(request, response) {
  response.redirect("/prototype_v3/relatives-with-cancer")
})

router.post('/prototype_v3/ageStartedSmokingAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v3/what-do-or-did-smoke")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v3/former-smoker-when-quit-smoking")
  } else {
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  }
})

// Former smoker quit date - skip periods page and go straight to tobacco selection
router.post('/prototype_v3/former-smoker-when-quit-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/what-do-or-did-smoke")
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function moveToNextTobaccoType(request, response) {
  var queue = request.session.data['tobaccoQueue'] || []
  var index = request.session.data['tobaccoQueueIndex'] || 0
  index++
  request.session.data['tobaccoQueueIndex'] = index
  
  if (index < queue.length) {
    response.redirect(queue[index])
  } else {
    response.redirect('/prototype_v3/check-your-answers')
  }
}

function routeByFrequency(request, response, fieldPrefix, basePath) {
  var frequency = request.session.data[fieldPrefix + 'Frequency']
  
  if (frequency === 'Daily') {
    response.redirect(basePath + '/quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect(basePath + '/quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect(basePath + '/quantity-monthly')
  } else {
    response.redirect(basePath + '/frequency')
  }
}

function handleChangesRouting(request, response, changesFieldName, basePath) {
  var changes = request.session.data[changesFieldName]
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('increased')) {
    response.redirect(basePath + '/increased-frequency')
  } else if (changes.includes('decreased')) {
    response.redirect(basePath + '/decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect(basePath + '/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
}

function handleIncreasedRouting(request, response, changesFieldName, frequencyFieldName, basePath) {
  var frequency = request.session.data[frequencyFieldName]
  
  if (frequency === 'Daily') {
    response.redirect(basePath + '/increased-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect(basePath + '/increased-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect(basePath + '/increased-quantity-monthly')
  } else {
    response.redirect(basePath + '/increased-frequency')
  }
}

function handleAfterIncreasedQuantity(request, response, changesFieldName, basePath) {
  var changes = request.session.data[changesFieldName]
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect(basePath + '/decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect(basePath + '/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
}

function handleDecreasedRouting(request, response, frequencyFieldName, basePath) {
  var frequency = request.session.data[frequencyFieldName]
  
  if (frequency === 'Daily') {
    response.redirect(basePath + '/decreased-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect(basePath + '/decreased-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect(basePath + '/decreased-quantity-monthly')
  } else {
    response.redirect(basePath + '/decreased-frequency')
  }
}

function handleAfterDecreasedQuantity(request, response, changesFieldName, basePath) {
  var changes = request.session.data[changesFieldName]
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect(basePath + '/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
}

// ============================================
// TOBACCO TYPE SELECTION ROUTING
// ============================================

router.post('/prototype_v3/whatDoYouSmokeAnswer', function(request, response) {
  var selectedCurrent = request.session.data['whatSmokeNow']
  var selectedFormer = request.session.data['whatDidSmoke']
  
  // Ensure they're arrays
  if (!Array.isArray(selectedCurrent)) {
    selectedCurrent = selectedCurrent ? [selectedCurrent] : []
  }
  if (!Array.isArray(selectedFormer)) {
    selectedFormer = selectedFormer ? [selectedFormer] : []
  }
  
  const tobaccoRoutes = {
    'Cigarettes': { current: '/prototype_v3/tobacco/cigarettes/current/years-smoked', former: '/prototype_v3/tobacco/cigarettes/former/years-smoked' },
    'Rolled cigarettes': { current: '/prototype_v3/tobacco/rolled-cigarettes/current/years-smoked', former: '/prototype_v3/tobacco/rolled-cigarettes/former/years-smoked' },
    'Pipe': { current: '/prototype_v3/tobacco/pipe/current/years-smoked', former: '/prototype_v3/tobacco/pipe/former/years-smoked' },
    'Cigars': { current: '/prototype_v3/tobacco/cigars/current/years-smoked', former: '/prototype_v3/tobacco/cigars/former/years-smoked' },
    'Hookah': { current: '/prototype_v3/tobacco/hookah/current/years-smoked', former: '/prototype_v3/tobacco/hookah/former/years-smoked' }
  }
  
  var tobaccoQueue = []
  var tobaccoOrder = ['Cigarettes', 'Rolled cigarettes', 'Pipe', 'Cigars', 'Hookah']
  
  // Add current tobacco types first, then former
  tobaccoOrder.forEach(function(type) {
    if (selectedCurrent.includes(type)) {
      tobaccoQueue.push(tobaccoRoutes[type].current)
    }
  })
  
  tobaccoOrder.forEach(function(type) {
    if (selectedFormer.includes(type)) {
      tobaccoQueue.push(tobaccoRoutes[type].former)
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

router.post('/prototype_v3/whatDidYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatDidSmoke']
  
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : []
  }
  
  const tobaccoRoutes = {
    'Cigarettes': '/prototype_v3/tobacco/cigarettes/former/years-smoked',
    'Rolled cigarettes': '/prototype_v3/tobacco/rolled-cigarettes/former/years-smoked',
    'Pipe': '/prototype_v3/tobacco/pipe/former/years-smoked',
    'Cigars': '/prototype_v3/tobacco/cigars/former/years-smoked',
    'Hookah': '/prototype_v3/tobacco/hookah/former/years-smoked'
  }
  
  var tobaccoQueue = []
  var tobaccoOrder = ['Cigarettes', 'Rolled cigarettes', 'Pipe', 'Cigars', 'Hookah']
  
  tobaccoOrder.forEach(function(type) {
    if (selectedTobacco.includes(type)) {
      tobaccoQueue.push(tobaccoRoutes[type])
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
// CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/current/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'cigarettesCurrent', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarettesCurrentChanges', 'cigarettesCurrentIncreasedFrequency', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarettesCurrentDecreasedFrequency', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesCurrentChanges', '/prototype_v3/tobacco/cigarettes/current')
})

router.post('/prototype_v3/tobacco/cigarettes/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/former/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'cigarettesFormer', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarettesFormerChanges', 'cigarettesFormerIncreasedFrequency', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarettesFormerDecreasedFrequency', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarettesFormerChanges', '/prototype_v3/tobacco/cigarettes/former')
})

router.post('/prototype_v3/tobacco/cigarettes/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// ROLLED CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/frequency')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'rolledCigarettesCurrent', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'rolledCigarettesCurrentChanges', 'rolledCigarettesCurrentIncreasedFrequency', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'rolledCigarettesCurrentDecreasedFrequency', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesCurrentChanges', '/prototype_v3/tobacco/rolled-cigarettes/current')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// ROLLED CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/frequency')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'rolledCigarettesFormer', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'rolledCigarettesFormerChanges', 'rolledCigarettesFormerIncreasedFrequency', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'rolledCigarettesFormerDecreasedFrequency', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'rolledCigarettesFormerChanges', '/prototype_v3/tobacco/rolled-cigarettes/former')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// PIPE ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/pipe/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/frequency')
})

router.post('/prototype_v3/tobacco/pipe/current/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'pipeCurrent', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'pipeCurrentChanges', 'pipeCurrentIncreasedFrequency', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'pipeCurrentDecreasedFrequency', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeCurrentChanges', '/prototype_v3/tobacco/pipe/current')
})

router.post('/prototype_v3/tobacco/pipe/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// PIPE ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/pipe/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/frequency')
})

router.post('/prototype_v3/tobacco/pipe/former/frequency-answer', function(request, response) {
  routeByFrequency(request, response, 'pipeFormer', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'pipeFormerChanges', 'pipeFormerIncreasedFrequency', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'pipeFormerDecreasedFrequency', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'pipeFormerChanges', '/prototype_v3/tobacco/pipe/former')
})

router.post('/prototype_v3/tobacco/pipe/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARS ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigars/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/frequency')
})

router.post('/prototype_v3/tobacco/cigars/current/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/size')
})

router.post('/prototype_v3/tobacco/cigars/current/size-answer', function(request, response) {
  var selectedSizes = request.session.data['cigarsCurrentSize']
  var frequency = request.session.data['cigarsCurrentFrequency']
  
  if (!Array.isArray(selectedSizes)) {
    selectedSizes = selectedSizes ? [selectedSizes] : []
  }
  
  // Create queue for cigar sizes: cigarillo, small, medium, large
  var sizeQueue = []
  var sizeOrder = ['cigarillo', 'small', 'medium', 'large']
  
  sizeOrder.forEach(function(size) {
    if (selectedSizes.includes(size)) {
      sizeQueue.push(size)
    }
  })
  
  request.session.data['cigarSizeQueue'] = sizeQueue
  request.session.data['cigarSizeIndex'] = 0
  
  if (sizeQueue.length > 0) {
    var firstSize = sizeQueue[0]
    var frequencyPath = frequency === 'Daily' ? 'daily' : frequency === 'Weekly' ? 'weekly' : 'monthly'
    response.redirect('/prototype_v3/tobacco/cigars/current/' + firstSize + '/quantity-' + frequencyPath)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// Helper function for moving to next cigar size or tobacco type
function moveToNextCigarSize(request, response, statusType) {
  var sizeQueue = request.session.data['cigarSizeQueue'] || []
  var sizeIndex = request.session.data['cigarSizeIndex'] || 0
  var frequency = request.session.data['cigars' + statusType + 'Frequency']
  
  sizeIndex++
  request.session.data['cigarSizeIndex'] = sizeIndex
  
  if (sizeIndex < sizeQueue.length) {
    var nextSize = sizeQueue[sizeIndex]
    var frequencyPath = frequency === 'Daily' ? 'daily' : frequency === 'Weekly' ? 'weekly' : 'monthly'
    response.redirect('/prototype_v3/tobacco/cigars/' + statusType.toLowerCase() + '/' + nextSize + '/quantity-' + frequencyPath)
  } else {
    moveToNextTobaccoType(request, response)
  }
}

// Cigarillo - Current
router.post('/prototype_v3/tobacco/cigars/current/cigarillo/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsCurrentCigarilloChanges', 'cigarsCurrentCigarilloIncreasedFrequency', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsCurrentCigarilloDecreasedFrequency', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentCigarilloChanges', '/prototype_v3/tobacco/cigars/current/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/current/cigarillo/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Current')
})

// Small - Current
router.post('/prototype_v3/tobacco/cigars/current/small/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsCurrentSmallChanges', 'cigarsCurrentSmallIncreasedFrequency', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsCurrentSmallDecreasedFrequency', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentSmallChanges', '/prototype_v3/tobacco/cigars/current/small')
})

router.post('/prototype_v3/tobacco/cigars/current/small/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Current')
})

// Medium - Current
router.post('/prototype_v3/tobacco/cigars/current/medium/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsCurrentMediumChanges', 'cigarsCurrentMediumIncreasedFrequency', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsCurrentMediumDecreasedFrequency', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentMediumChanges', '/prototype_v3/tobacco/cigars/current/medium')
})

router.post('/prototype_v3/tobacco/cigars/current/medium/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Current')
})

// Large - Current
router.post('/prototype_v3/tobacco/cigars/current/large/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsCurrentLargeChanges', 'cigarsCurrentLargeIncreasedFrequency', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsCurrentLargeDecreasedFrequency', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsCurrentLargeChanges', '/prototype_v3/tobacco/cigars/current/large')
})

router.post('/prototype_v3/tobacco/cigars/current/large/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Current')
})

// ============================================
// CIGARS ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigars/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/frequency')
})

router.post('/prototype_v3/tobacco/cigars/former/frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/size')
})

router.post('/prototype_v3/tobacco/cigars/former/size-answer', function(request, response) {
  var selectedSizes = request.session.data['cigarsFormerSize']
  var frequency = request.session.data['cigarsFormerFrequency']
  
  if (!Array.isArray(selectedSizes)) {
    selectedSizes = selectedSizes ? [selectedSizes] : []
  }
  
  var sizeQueue = []
  var sizeOrder = ['cigarillo', 'small', 'medium', 'large']
  
  sizeOrder.forEach(function(size) {
    if (selectedSizes.includes(size)) {
      sizeQueue.push(size)
    }
  })
  
  request.session.data['cigarSizeQueue'] = sizeQueue
  request.session.data['cigarSizeIndex'] = 0
  
  if (sizeQueue.length > 0) {
    var firstSize = sizeQueue[0]
    var frequencyPath = frequency === 'Daily' ? 'daily' : frequency === 'Weekly' ? 'weekly' : 'monthly'
    response.redirect('/prototype_v3/tobacco/cigars/former/' + firstSize + '/quantity-' + frequencyPath)
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// Cigarillo - Former
router.post('/prototype_v3/tobacco/cigars/former/cigarillo/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsFormerCigarilloChanges', 'cigarsFormerCigarilloIncreasedFrequency', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsFormerCigarilloDecreasedFrequency', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerCigarilloChanges', '/prototype_v3/tobacco/cigars/former/cigarillo')
})

router.post('/prototype_v3/tobacco/cigars/former/cigarillo/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Former')
})

// Small - Former
router.post('/prototype_v3/tobacco/cigars/former/small/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsFormerSmallChanges', 'cigarsFormerSmallIncreasedFrequency', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsFormerSmallDecreasedFrequency', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerSmallChanges', '/prototype_v3/tobacco/cigars/former/small')
})

router.post('/prototype_v3/tobacco/cigars/former/small/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Former')
})

// Medium - Former
router.post('/prototype_v3/tobacco/cigars/former/medium/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsFormerMediumChanges', 'cigarsFormerMediumIncreasedFrequency', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsFormerMediumDecreasedFrequency', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerMediumChanges', '/prototype_v3/tobacco/cigars/former/medium')
})

router.post('/prototype_v3/tobacco/cigars/former/medium/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Former')
})

// Large - Former
router.post('/prototype_v3/tobacco/cigars/former/large/quantity-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/quantity-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/quantity-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/increased-frequency-answer', function(request, response) {
  handleIncreasedRouting(request, response, 'cigarsFormerLargeChanges', 'cigarsFormerLargeIncreasedFrequency', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/increased-quantity-daily-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/increased-quantity-weekly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/increased-quantity-monthly-answer', function(request, response) {
  handleAfterIncreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/decreased-frequency-answer', function(request, response) {
  handleDecreasedRouting(request, response, 'cigarsFormerLargeDecreasedFrequency', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/decreased-quantity-daily-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/decreased-quantity-weekly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/decreased-quantity-monthly-answer', function(request, response) {
  handleAfterDecreasedQuantity(request, response, 'cigarsFormerLargeChanges', '/prototype_v3/tobacco/cigars/former/large')
})

router.post('/prototype_v3/tobacco/cigars/former/large/stopped-years-answer', function(request, response) {
  moveToNextCigarSize(request, response, 'Former')
})

// ============================================
// HOOKAH ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/hookah/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/session-type')
})

router.post('/prototype_v3/tobacco/hookah/current/session-type-answer', function(request, response) {
  var sessionTypes = request.session.data['hookahCurrentSessionType']
  
  if (!Array.isArray(sessionTypes)) {
    sessionTypes = sessionTypes ? [sessionTypes] : []
  }
  
  // Create queue for session types: group first, then solo
  var sessionQueue = []
  if (sessionTypes.includes('group')) {
    sessionQueue.push('group')
  }
  if (sessionTypes.includes('solo')) {
    sessionQueue.push('solo')
  }
  
  request.session.data['hookahSessionQueue'] = sessionQueue
  request.session.data['hookahSessionIndex'] = 0
  
  if (sessionQueue.length > 0) {
    response.redirect('/prototype_v3/tobacco/hookah/current/' + sessionQueue[0] + '-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// Helper function for moving to next hookah session type or tobacco type
function moveToNextHookahSession(request, response, statusType) {
  var sessionQueue = request.session.data['hookahSessionQueue'] || []
  var sessionIndex = request.session.data['hookahSessionIndex'] || 0
  
  sessionIndex++
  request.session.data['hookahSessionIndex'] = sessionIndex
  
  if (sessionIndex < sessionQueue.length) {
    var nextSession = sessionQueue[sessionIndex]
    response.redirect('/prototype_v3/tobacco/hookah/' + statusType.toLowerCase() + '/' + nextSession + '-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
}

// Group - Current
router.post('/prototype_v3/tobacco/hookah/current/group-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentGroupFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-duration-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/group-changes-daily')
})

router.post('/prototype_v3/tobacco/hookah/current/group-duration-weekly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/group-changes-weekly')
})

router.post('/prototype_v3/tobacco/hookah/current/group-duration-monthly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/group-changes-monthly')
})

router.post('/prototype_v3/tobacco/hookah/current/group-changes-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentGroupChangesDaily', '/prototype_v3/tobacco/hookah/current/group')
})

router.post('/prototype_v3/tobacco/hookah/current/group-changes-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentGroupChangesWeekly', '/prototype_v3/tobacco/hookah/current/group')
})

router.post('/prototype_v3/tobacco/hookah/current/group-changes-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentGroupChangesMonthly', '/prototype_v3/tobacco/hookah/current/group')
})

router.post('/prototype_v3/tobacco/hookah/current/group-increased-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentGroupIncreasedFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-increased-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-increased-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-increased-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-increased-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-increased-duration-daily-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesDaily']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-increased-duration-weekly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesWeekly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-increased-duration-monthly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesMonthly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-decreased-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentGroupDecreasedFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-decreased-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-decreased-duration-daily-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesDaily']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-decreased-duration-weekly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesWeekly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-decreased-duration-monthly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentGroupChangesMonthly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/group-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/group-stopped-years-answer', function(request, response) {
  moveToNextHookahSession(request, response, 'Current')
})

// Solo - Current
router.post('/prototype_v3/tobacco/hookah/current/solo-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentSoloFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-duration-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/solo-changes-daily')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-duration-weekly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/solo-changes-weekly')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-duration-monthly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/current/solo-changes-monthly')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-changes-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentSoloChangesDaily', '/prototype_v3/tobacco/hookah/current/solo')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-changes-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentSoloChangesWeekly', '/prototype_v3/tobacco/hookah/current/solo')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-changes-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahCurrentSoloChangesMonthly', '/prototype_v3/tobacco/hookah/current/solo')
})

router.post('/prototype_v3/tobacco/hookah/current/solo-increased-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentSoloIncreasedFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-increased-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-increased-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-increased-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-increased-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-increased-duration-daily-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesDaily']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-increased-duration-weekly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesWeekly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-increased-duration-monthly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesMonthly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decreased')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-decreased-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahCurrentSoloDecreasedFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-decreased-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-daily-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesDaily']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-weekly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesWeekly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-decreased-duration-monthly-answer', function(request, response) {
  var changes = request.session.data['hookahCurrentSoloChangesMonthly']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/hookah/current/solo-stopped-years')
  } else {
    moveToNextHookahSession(request, response, 'Current')
  }
})

router.post('/prototype_v3/tobacco/hookah/current/solo-stopped-years-answer', function(request, response) {
  moveToNextHookahSession(request, response, 'Current')
})

// ============================================
// HOOKAH ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/hookah/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/former/session-type')
})

router.post('/prototype_v3/tobacco/hookah/former/session-type-answer', function(request, response) {
  var sessionTypes = request.session.data['hookahFormerSessionType']
  
  if (!Array.isArray(sessionTypes)) {
    sessionTypes = sessionTypes ? [sessionTypes] : []
  }
  
  var sessionQueue = []
  if (sessionTypes.includes('group')) {
    sessionQueue.push('group')
  }
  if (sessionTypes.includes('solo')) {
    sessionQueue.push('solo')
  }
  
  request.session.data['hookahSessionQueue'] = sessionQueue
  request.session.data['hookahSessionIndex'] = 0
  
  if (sessionQueue.length > 0) {
    response.redirect('/prototype_v3/tobacco/hookah/former/' + sessionQueue[0] + '-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// Group - Former
router.post('/prototype_v3/tobacco/hookah/former/group-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahFormerGroupFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/former/group-duration-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/former/group-changes-daily')
})

router.post('/prototype_v3/tobacco/hookah/former/group-duration-weekly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/former/group-changes-weekly')
})

router.post('/prototype_v3/tobacco/hookah/former/group-duration-monthly-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/hookah/former/group-changes-monthly')
})

router.post('/prototype_v3/tobacco/hookah/former/group-changes-daily-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahFormerGroupChangesDaily', '/prototype_v3/tobacco/hookah/former/group')
})

router.post('/prototype_v3/tobacco/hookah/former/group-changes-weekly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahFormerGroupChangesWeekly', '/prototype_v3/tobacco/hookah/former/group')
})

router.post('/prototype_v3/tobacco/hookah/former/group-changes-monthly-answer', function(request, response) {
  handleChangesRouting(request, response, 'hookahFormerGroupChangesMonthly', '/prototype_v3/tobacco/hookah/former/group')
})

router.post('/prototype_v3/tobacco/hookah/former/group-increased-frequency-answer', function(request, response) {
  var frequency = request.session.data['hookahFormerGroupIncreasedFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-increased-duration-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-increased-duration-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-increased-duration-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/hookah/former/group-increased-frequency')
  }
})

router.post('/prototype_v3/tobacco/hookah/former/group-increased-duration-daily-answer', function(request, response) {
  var changes = request.session.data['hookahFormerGroupChangesDaily']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('decrease')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-increased-duration-weekly-answer', function(request, response) {
var changes = request.session.data['hookahFormerGroupChangesWeekly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('decreased')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-increased-duration-monthly-answer', function(request, response) {
var changes = request.session.data['hookahFormerGroupChangesMonthly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('decreased')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-decreased-frequency-answer', function(request, response) {
var frequency = request.session.data['hookahFormerGroupDecreasedFrequency']
if (frequency === 'Daily') {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-duration-daily')
} else if (frequency === 'Weekly') {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-duration-weekly')
} else if (frequency === 'Monthly') {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-duration-monthly')
} else {
response.redirect('/prototype_v3/tobacco/hookah/former/group-decreased-frequency')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-decreased-duration-daily-answer', function(request, response) {
var changes = request.session.data['hookahFormerGroupChangesDaily']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-decreased-duration-weekly-answer', function(request, response) {
var changes = request.session.data['hookahFormerGroupChangesWeekly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-decreased-duration-monthly-answer', function(request, response) {
var changes = request.session.data['hookahFormerGroupChangesMonthly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/group-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/group-stopped-years-answer', function(request, response) {
moveToNextHookahSession(request, response, 'Former')
})
// Solo - Former
router.post('/prototype_v3/tobacco/hookah/former/solo-frequency-answer', function(request, response) {
var frequency = request.session.data['hookahFormerSoloFrequency']
if (frequency === 'Daily') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-duration-daily')
} else if (frequency === 'Weekly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-duration-weekly')
} else if (frequency === 'Monthly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-duration-monthly')
} else {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-frequency')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-duration-daily-answer', function(request, response) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-changes-daily')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-duration-weekly-answer', function(request, response) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-changes-weekly')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-duration-monthly-answer', function(request, response) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-changes-monthly')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-changes-daily-answer', function(request, response) {
handleChangesRouting(request, response, 'hookahFormerSoloChangesDaily', '/prototype_v3/tobacco/hookah/former/solo')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-changes-weekly-answer', function(request, response) {
handleChangesRouting(request, response, 'hookahFormerSoloChangesWeekly', '/prototype_v3/tobacco/hookah/former/solo')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-changes-monthly-answer', function(request, response) {
handleChangesRouting(request, response, 'hookahFormerSoloChangesMonthly', '/prototype_v3/tobacco/hookah/former/solo')
})
router.post('/prototype_v3/tobacco/hookah/former/solo-increased-frequency-answer', function(request, response) {
var frequency = request.session.data['hookahFormerSoloIncreasedFrequency']
if (frequency === 'Daily') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-increased-duration-daily')
} else if (frequency === 'Weekly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-increased-duration-weekly')
} else if (frequency === 'Monthly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-increased-duration-monthly')
} else {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-increased-frequency')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-increased-duration-daily-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesDaily']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('decreased')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-increased-duration-weekly-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesWeekly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('decreased')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-increased-duration-monthly-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesMonthly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('decreased')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-frequency')
} else if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-decreased-frequency-answer', function(request, response) {
var frequency = request.session.data['hookahFormerSoloDecreasedFrequency']
if (frequency === 'Daily') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-daily')
} else if (frequency === 'Weekly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-weekly')
} else if (frequency === 'Monthly') {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-monthly')
} else {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-decreased-frequency')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-daily-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesDaily']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-weekly-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesWeekly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-decreased-duration-monthly-answer', function(request, response) {
var changes = request.session.data['hookahFormerSoloChangesMonthly']
if (!Array.isArray(changes)) {
changes = changes ? [changes] : []
}
if (changes.includes('stopped')) {
response.redirect('/prototype_v3/tobacco/hookah/former/solo-stopped-years')
} else {
moveToNextHookahSession(request, response, 'Former')
}
})
router.post('/prototype_v3/tobacco/hookah/former/solo-stopped-years-answer', function(request, response) {
moveToNextHookahSession(request, response, 'Former')
})
module.exports = router