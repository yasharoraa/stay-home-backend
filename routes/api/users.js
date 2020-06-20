var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var UserTemp = mongoose.model('TempUser');
var UserReset = mongoose.model('ResetUser');
var auth = require('../auth');

router.get('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        return res.json(user.toAuthJSON());
    }).catch(next);
});

router.get('/check', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user || req.payload.salt !== user.salt ) { return res.sendStatus(401); }
        return res.json({ firebase: user.firebase });
    }).catch(next);
});

router.put('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user || req.payload.salt !== user.salt) { return res.sendStatus(401); }

        // only update fields that were actually passed...
        if (typeof req.body.name !== 'undefined') {
            user.name = req.body.name;
        }
        if (typeof req.body.address !== 'undefined') {
            user.address = req.body.address;
        }
        if (typeof req.body.pincode !== 'undefined') {
            user.pincode = req.body.pincode;
        }

        return user.save().then(function () {
            return res.json(user.toAuthJSON());
        });
    }).catch(next);
});

router.post('/login', function (req, res, next) {
    if (!req.body.user.phone) {
        return res.status(422).json({ errors: { phone: "can't be blank" } });
    }

    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "can't be blank" } });
    }
    req.isStore = false;
    passport.authenticate('local', { session: false }, function (err, user, info) {
        if (err) { return next(err); }

        if (user) {
            return res.json(user.toAuthJSON());
        } else {
            console.log(info);
            return res.status(422).json(info);
        }
    })(req, res, next);
});


router.post('/:temp', function (req, res, next) {
    UserTemp.findById(req.params.temp).then(function (temp) {
        if (!temp) { return res.status(422).send({ errors: { 'User': 'OTP Expired' } }) };
        if (Number(req.query.otp) === temp.code) {
            var user = new User();
            user.phone = temp.phone;
            user.setPassword(temp.password);
            user.save().then(function (user) {
                return res.json(user.toAuthJSON());
            }).catch(next);
        } else {
            return res.status(422).send({ errors: { 'User': 'OTP Incorrect' } })
        }
    }).catch(next);

});

router.put('/reset', function (req, res, next) {
    if (req.body.reset === 'undefined') { return res.status(500).send({ errors: { 'Id': 'Invalid Id, Please try again later.' } }); }
    UserReset.findById(req.body.reset).then(function (reset) {
        if (!reset) { return res.status(422).send({ errors: { 'User': 'OTP Expired' } }) };
        if (req.body.phone === reset.phone) {
            if (req.body.code === reset.code) {
                if (req.body.password !== 'undefined') {
                    User.findOne({ phone: reset.phone }).then(function (user) {
                        if (!user) { return res.sendStatus(401); }
                        user.setPassword(req.body.password);
                        user.save().then(reset.deleteOne())
                            .then(function () {
                                return res.sendStatus(200);
                            }).catch(next);
                    }).catch(next);
                } else {
                    return res.status(500).send({ errors: { 'User': 'Invalid Password, Please try again later.' } });
                }
            } else {
                return res.status(401).send({ errors: { 'OTP': 'Incorrect OTP' } });
            }
        } else {
            return res.status(500).send({ errors: { 'User': 'Invalid Phone Number, Please try again later.' } });
        }
    }).catch(next);
});

router.put('/firebase', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user || req.payload.salt !== user.salt) { return res.sendStatus(401); }
        if (typeof req.query.firebase !== 'undefined') {
            user.firebase = req.query.firebase;
            return user.save().then(function () {
                //  setTimeout(()=> res.sendStatus(200),2000 );
                return res.sendStatus(200);
            }).catch(next);
        } else {
            return res.sendStatus(500);
        }
    }).catch(next);
});

router.get('/', auth.required, function (req, res, next) {

    User.findById(req.payload.id).then(function (user) {
        if (!user || req.payload.salt !== user.salt) { return res.sendStatus(401); }
        return res.json(user.toProfileJSONFor());
    }).catch(next);
});

router.get('/profile', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user || req.payload.salt !== user.salt) { return res.sendStatus(401); }
        return res.json(user.toProfileJSONFor());
    }).catch(next);
});

module.exports = router;