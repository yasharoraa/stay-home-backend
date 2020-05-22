var router = require('express').Router();
var auth = require('../auth');

router.get('/',auth.required,function(req,res,next) {
    return res.json({key : require('../../config').google_api_key});
});

module.exports = router;