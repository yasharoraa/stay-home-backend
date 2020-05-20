var router = require('express').Router();

router.get('/user',function(req,res,next) {
    return res.status(200).send((require('../../config').minimim_user_app_version).toString());
});

router.get('/store',function(req,res,next) {
    return res.status(200).send((require('../../config').minimum_vendor_app_version).toString());
});

module.exports = router;