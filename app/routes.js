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
var smokedRegularly = request.session.data['smokedRegularly']

if (relativesHaveCancer == "Yes"){
  // If relatives had cancer, ask about their age first
  response.redirect("/prototype_v2/relatives-age-when-diagnosed")
} else if (relativesHaveCancer == "No" || relativesHaveCancer == "I don't know"){
  // No relatives with cancer OR don't know, route based on smoking status
 if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
  } else {
    // Fallback to original logic if smoking status unclear
    response.redirect("/prototype_v2/do-you-smoke-now")
  }
} else {
  response.redirect("/prototype_v2/relatives-with-cancer")
}
})

router.post('/prototype_v2/relatives-age-answer', function(request, response) {
var smokedRegularly = request.session.data['smokedRegularly']

if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
} else {
  // Fallback
  response.redirect("/prototype_v2/do-you-smoke-now")
}
})

router.get('/prototype_v2/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v2/eligibility-have-you-ever-smoked")
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
        response.redirect("/prototype_v2/what-is-your-height")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v2/drop-out-bmi")
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
  response.render('prototype_v2/task-list')
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