var router = require('express').Router();
var mongoose = require('mongoose');
var Address = mongoose.model('Address');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }
        Address.find({'user':req.payload.id})
        .sort('-createdAt')
        .exec(function(err, address) {
            if (err) { return res.sendStatus(500); }
            return res.json(address);
        });
    }).catch(next);
});

router.post('/',auth.required,function(req,res,next) {
    User.findById(req.payload.id)
    .then(function (user) {
        if (!user) { return res.sendStatus(401); }
        var address = new Address();
       
        if (typeof req.body.flat_address !== 'undefined') {
            address.flat_address = req.body.flat_address;
        }

        if (typeof req.body.number !== 'undefined') {
            address.number = req.body.number;
        }else{
            address.number = user.phone;
        }

        if (typeof req.body.htr !== 'undefined') {
            address.htr = req.body.htr;
        }
        if (typeof req.body.location !== 'undefined') {
            address.location = req.body.location;
        }
        if (typeof req.body.location_address !== 'undefined') {
            address.location_address = req.body.location_address;
        }
        address.user = req.payload.id;

        address.save().then(function(address) {
            // setTimeout(()=>res.json(address),2000 );
           return res.json(address);
        }).catch(next);
       
    }).catch(next);
});

module.exports = router;
