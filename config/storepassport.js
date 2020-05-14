var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Store = mongoose.model('Store');


passport.use(new LocalStrategy({
    usernameField: 'user[phone]',
    passwordField: 'user[password]'
  }, function(phone, password, done) {
    Store.findOne({phone: phone}).then(function(user){

      console.log("find_store");
    
      if(!user){
        return done(null, false, {errors: {'User': 'Phone number not registered !'}});
      }

      if(!user.validPassword(password)){
        return done(null, false, {errors: {'Password': 'Invalid password please try again.'}});
      }
      return done(null, user);
    }).catch(done);
  }));