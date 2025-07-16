// External dependencies
const express = require('express');

const router = express.Router();

// Add your routes here - above the module.exports line

module.exports = router;

router.post('/prototype_v1/relatives-with-cancer-answer', function(request, response) {
    var relativesHaveCancer = request.session.data['relativesHaveCancer']
    if (relativesHaveCancer == "Yes"){
        response.redirect("/prototype_v1/relatives-age-when-diagnosed")
    } else if (relativesHaveCancer == "No"){
        response.redirect("/prototype_v1/do-you-smoke-now")
    } else {
        response.redirect("/prototype_v1/relatives-with-cancer")
    }
})

router.get('/prototype_v1/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v1/what-is-your-date-of-birth")
})

router.post('/prototype_v1/smokedRegularlyAnswer', function(request, response) {
    var smokedRegularly = request.session.data['smokedRegularly']
    if (smokedRegularly == "Yes-currently"){
        response.redirect("/prototype_v1/task-list")
    } else if (smokedRegularly == "Yes-usedToRegularly"){
        response.redirect("/prototype_v1/task-list")
    } else if (smokedRegularly == "Yes-usedToFewTimes"){
        response.redirect("/prototype_v1/task-list")
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v1/drop-out-never-smoked")
    }
    else {
        response.redirect("/prototype_v1/have-you-smoked-regularly")
    }
})

router.post('/prototype_v1/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/current-smoker-how-many-years")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/former-smoker-how-many-years")
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
    var smokeNow = request.session.data['whatSmokeNow']
    if (smokeNow == "Cigarettes"){
        response.redirect("/prototype_v1/current-smoker-how-many-cigarettes-per-day")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/drop-out-bmi")
    } else {
        response.redirect("/prototype_v1/who-should-not-use-this-online-service")
    }
})

router.post('/prototype_v1/have-you-smoked-regularly', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect("/prototype_v1/what-is-your-date-of-birth")
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
  response.render('prototype_v1/have-you-smoked-regularly')
})