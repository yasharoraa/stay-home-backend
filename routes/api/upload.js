
var router = require('express').Router();
const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const multerS3 = require('multer-s3');
var mongoose = require('mongoose');
var Store = mongoose.model('Store');
var auth = require('../auth');
var key = require('../../config').spaces_key;
var secret = require('../../config').spaces_secret;
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: key,
    secretAccessKey: secret
});

// router.get('/', function (req, res, next) {
//     s3.listBuckets({}, function (err, data) {
//         if (err) {
//             console.log(err, err.stack);
//             res.sendStatus(401);
//         }
//         else {
//             data['Buckets'].forEach(function (space) {
//                 console.log(space['Name']);
//                 res.sendStatus(200);
//             })
//         };
//     });
// });

router.post('/', auth.required, function (req, res, next) {

    
    if (req.query.sub === 'stores') {
        Store.findById(req.payload.id).then(function (store) {
            if (!store) { return res.sendStatus(401); }
            return upload(req, res, function (error) {
                if (error) {
                    console.log(error);
                    return res.sendStatus(401);
                }
                store.profile_image = req.file.location;
                return store.save().then(function () {
                    return res.json({ image: req.file.location });
                }).catch(next);
            });
        }).catch(next);
    } else {
        return upload(req, res, function (error) {
            if (error) {
                console.log(error);
                return res.sendStatus(401);
            }
            console.log(req.file.location);
            console.log("File uploaded successfully.");
             return res.json({ image: req.file.location });
        });
    }

});

router.delete('/', function (req, res, next) {
    var params = {
        Bucket: "stayhome",
        Key: req.query.name
    };
    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return res.sendStatus(401);
        } else {
            console.log(data);
            return res.sendStatus(200);
        }
    });
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "stayhome",
        acl: "public-read",
        key: function (req, file, cb) {
            console.log(file);
            cb(null,
                ((typeof req.query.sub !== 'undefined')
                    ? req.query.sub + '/' : '') +
                Date.now() + file.originalname);
        }
    })
}).single("upload");


module.exports = router;


