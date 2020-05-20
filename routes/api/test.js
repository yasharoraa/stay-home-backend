var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
var sendNotification = require('../helpers/fcm');
var admin = require('firebase-admin');
var UserTemp = mongoose.model('TempUser');
var User = mongoose.model('User');

router.get('/', function (req, res, next) {
    res.json({ "test": "success" });
});

router.get('/genrate', function (req, res, next) {
    require('crypto').randomBytes(256, function (err, buffer) {
        var token = buffer.toString('hex');
        res.send(token);
    });
});

router.post('/temp', function (req, res, next) {
    var user = new UserTemp();
    user.phone = req.body.phone;
    user.pass = req.body.pass;
    user.code = req.body.code;
    user.save().then(function () {
        return res.json(user);
    }).catch(next);
});

router.get('/user/:phone',function(req,res,next) {
    User.findOne({phone:req.params.phone}).then(function (user,err) {
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        if(user){
            console.log(user);
            return res.sendStatus(200);
        }else{
            console.log("user does not exist");
            return res.sendStatus(200);
        }
    });
})




module.exports = router;