 var router = require('express').Router();
var mongoose = require('mongoose');
var Category = mongoose.model('Category');

router.get('/',function(req, res, next){
    Category.find({}).then(function (categories) {
        if (!categories) { return res.sendStatus(500); }

        return res.json(categories);
    }).catch(next);

});

router.get('/:id',function(req, res, next){
    Category.findById(req.id).then(function (categories,err) {
        
        if(err) console.log(err);
        console.log(req.id);
        Category.populate(req.id).then(function(category,err) {
            console.log(category +err);
            return res.json(categories);
        }) 
        
    }).catch(next);

});

module.exports = router;