var mongoose = require('mongoose');
var router = require('express').Router();
var ResetUser = mongoose.model('ResetUser');
var ResetStore = mongoose.model('ResetStore');
var Store = mongoose.model('Store');
var User = mongoose.model('User');
var sendSms = require('../helpers/sms');

router.get('/store/:phone', function (req, res, next) {
    Store.findOne({ phone: req.params.phone }).then(function (user) {
        if (!user) { return res.status(422).send({ errors: { 'User': 'Phone number not registered.' } }) };
        ResetStore.findOne({ phone: req.params.phone }).then(function (reset) {
            if (reset) {
                reset.expireAt = Date.now();
            } else {
                var reset = new ResetStore();
                reset.phone = req.params.phone;
            }
            reset.code = Math.floor(100000 + Math.random() * 900000);
            reset.save().then(function (reset) {
                sendSms(reset.phone, reset.code, 1).then(function (response, err) {
                    if (err) {
                        return res.status(422).send({ errors: { 'Message': 'There was a problem sending a verification code' } });
                    }
                    return res.json({ id: reset._id.toString() });
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

router.get('/user/:phone', function (req, res, next) {
    User.findOne({ phone: req.params.phone }).then(function (user) {
        if (!user) { return res.status(422).send({ errors: { 'User': 'Phone number not registered.' } }) };
        ResetUser.findOne({ phone: req.params.phone }).then(function (reset) {
            if (reset) {
                reset.expireAt = Date.now();
            } else {
                var reset = new ResetUser();
                reset.phone = req.params.phone;
            }
            reset.code = Math.floor(100000 + Math.random() * 900000);
            reset.save().then(function (reset) {
                console.log('user : ' + reset.phone);
                sendSms(reset.phone, reset.code, 1).then(function (response, err) {
                    if (err) {
                        return res.status(422).send({ errors: { 'Message': 'There was a problem sending a verification code' } });
                    }
                    return res.json({ id: reset._id.toString() });
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

module.exports = router;



