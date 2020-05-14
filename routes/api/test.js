var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
var sendNotification = require('../helpers/fcm');
var admin = require('firebase-admin');
var UserTemp = mongoose.model('TempUser');

router.get('/', function (req, res, next) {
    res.json({"test" : "success"});
});

router.get('/send',function (req,res,next) {
   return sendNotification(res);
});

router.post('/temp',function(req,res,next) {
    var user = new UserTemp();
    user.phone = req.body.phone;
    user.pass = req.body.pass;
    user.code = req.body.code;
    user.save().then(function () {
        return res.json(user);
    }).catch(next);
});

module.exports = router;