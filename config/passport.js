const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
module.exports.init = function(){
    passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password'
    },(function(email, password, done) {
        console.log('LocalStrategy.local'+email);
        User.findOne({ email: email }, function (err, user) {
        console.log('LocalStrategy'+ err ,user);
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.verifyPassword(password)) { return done(null, false); }
          return done(null, user);
        });
      }
    )));
  
    passport.serializeUser(function(user, done) {
        console.log('serializeUser.local'+user);
        
      done(null, user._id);
    });
     
    passport.deserializeUser(function(id, done) {
        console.log('serializeUser.local'+id);
        User.findById(id, function (err, user) {
          console.log('deserializeUser'+err,user);
          
        done(err, user);
      });
    });
}
