// External dependencies
const express = require('express');

const router = express.Router();

// Add your routes here - above the module.exports line

module.exports = router;

router.post('/relatives-with-cancer', function(request, response) {
    var relativesCancer = request.session.data['relativesCancer']
    if (relativesCancer == "Yes"){
        response.redirect("/relatives-age-when-diagnosed")
    } else {
        response.redirect("/have-you-smoked-regularly")
    }
})