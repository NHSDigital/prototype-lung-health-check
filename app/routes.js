// External dependencies
const express = require('express');

const router = express.Router();

// Add your routes here - above the module.exports line

module.exports = router;

router.post('/prototype_v1/relatives-age-when-diagnosed', function(request, response) {
    var relatives = request.session.data['relativesCancer']
    if (relatives == "Yes"){
        response.redirect("/prototype_v1/relatives-age-when-diagnosed")
    } else {
        response.redirect("/prototype_v1/have-you-smoked-regularly")
    }
})