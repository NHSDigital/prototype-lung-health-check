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
        response.redirect("/prototype_v1/what-age-started-smoking")
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v1/check-your-answers")
    } else {
        response.redirect("/prototype_v1/have-you-smoked-regularly")
    }
})