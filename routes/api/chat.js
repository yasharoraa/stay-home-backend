var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var Message = mongoose.model('Message');
var auth = require('../auth');
var lastMessages = require('../helpers/lastmessage');

router.get('/', auth.required, function (req, res, next) {
  if (typeof req.query.type === 'undefined') {
    console.log("No type defined.")
    return res.sendStatus(500);
  }
  // lastMessages(req.payload.id,
  //   typeof req.query.offset !== 'undefined' ? Number(req.query.offset) : 0,
  //   typeof req.query.limit !== 'undefined' ? Number(req.query.limit) : 10
  //   ).exec(function(err,result){
  //   if(err) {
  //     console.log(err);
  //     return res.sendStatus(500);
  //   }
  //   if(result) {
  //     Message.populate(result,{path : '_id', model : req.query.type == 1 ? 'Store' : 'User', select : ['name','image'] }, function(err,chat) {
  //       if(chat) {
  //         console.log(chat);
  //         return res.json(chat);
  //       }
  //       if(err) {
  //         console.log(err);
  //         return res.sendStatus(500); 
  //       }
  //     });
  //   }
  // });

  return lastMessages(req.payload.id,
    typeof req.query.offset !== 'undefined' ? Number(req.query.offset) : 0,
    typeof req.query.limit !== 'undefined' ? Number(req.query.limit) : 10,
    req.query.type).then(function (response) {
      return res.json(response);
    }).catch(next);
});


module.exports = router;