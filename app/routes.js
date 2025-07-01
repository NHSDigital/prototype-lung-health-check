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
        response.redirect("/prototype_v1/have-you-smoked-regularly")
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
    if (smokedRegularly == "Yes"){
        response.redirect("/prototype_v1/task-list")
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v1/drop-out-never-smoked")
    } else {
        response.redirect("/prototype_v1/have-you-smoked-regularly")
    }
})

router.post('/prototype_v1/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/how-mainy-cigarettes-per-day")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/how-many-cigarettes-per-day")
    } else {
        response.redirect("/prototype_v1/do-you-smoke-now")
    }
})