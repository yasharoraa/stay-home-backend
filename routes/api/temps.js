var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var StoreTemp = mongoose.model('TempStore');
var UserTemp = mongoose.model('TempUser');
var Store = mongoose.model('Store');
var User = mongoose.model('User');
var sendSms = require('../helpers/sms');

router.post('/store', function (req, res, next) {
    if (typeof req.body.user.phone !== 'undefined' && typeof req.body.user.password !== 'undefined') {
        Store.findOne({ phone: req.body.user.phone }).then(function (user) {
            if (user) { return res.status(422).send({ errors: { 'User': 'Phone number already exists. Please login to continue.' } }) };
            StoreTemp.findOne({ phone: req.body.user.phone }).then(function (temp) {
                if (temp) {
                    temp.expireAt = Date.now();
                } else {
                    var temp = new StoreTemp();
                    temp.phone = req.body.user.phone;
                }
                temp.password = req.body.user.password;
                temp.code = Math.floor(100000 + Math.random() * 900000);
                temp.save().then(function (temp) {
                    sendSms(temp.phone, temp.code, 0).then(function (response, err) {
                        if (err) {
                            return res.status(422).send({ errors: { 'Message': 'There was a problem sending a verification code' } });
                        }
                        return res.json({ id: temp._id.toString() });
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        }).catch(next);
    } else {
        return res.sendStatus(500);
    }
});

router.post('/user', function (req, res, next) {
    if (typeof req.body.user.phone !== 'undefined' && typeof req.body.user.password !== 'undefined') {
        User.findOne({ phone: req.body.user.phone }).then(function (user) {
            if (user) { return res.status(422).send({ errors: { 'User': 'Phone number already exists. Please login to continue.' } }) };
            UserTemp.findOne({ phone: req.body.user.phone }).then(function (temp) {
                if (temp) {
                    temp.expireAt = Date.now();
                } else {
                    var temp = new UserTemp();
                    temp.phone = req.body.user.phone;
                }
                temp.password = req.body.user.password;
                temp.code = Math.floor(100000 + Math.random() * 900000);
                temp.save().then(function (temp) {
                    sendSms(temp.phone, temp.code, 0).then(function (response, err) {
                        if (err) {
                            return res.status(422).send({ errors: { 'Message': 'There was a problem sending a verification code' } });
                        }
                        return res.json({ id: temp._id.toString() });
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        }).catch(next);
    } else {
        return res.sendStatus(500);
    }
});

module.exports = router;