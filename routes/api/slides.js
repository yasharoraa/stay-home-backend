var router = require('express').Router();
var mongoose = require('mongoose');
var Slide = mongoose.model('Slide');

router.get('/',function(req, res, next){
    Slide.find({}).then(function (slides) {
        if (!slides) { return res.sendStatus(500); }

        return res.json(slides);
    }).catch(next);

});

module.exports = router;