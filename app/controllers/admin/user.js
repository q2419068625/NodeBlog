const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const User = mongoose.model('User');
const passport = require('passport')
const {check,validationResult } = require('express-validator')
const md5 = require('md5')
module.exports = (app) => {
  app.use('/admin/users', router);
};
module.exports.requireLogin = function(req,res,next){
  if(req.user){
    next()
  }else{
    next(new Error('登录后操作'))
  }
}

router.get('/login', (req, res, next) => {
    res.render('admin/user/login',{
    })
});
router.post('/login',passport.authenticate('local', { failureRedirect: '/admin/users/login' }), (req, res, next) => {
  console.log('user login success' + req.body);
  res.redirect('/admin/posts')
});

router.get('/register', (req, res, next) => {
  res.render('admin/user/register',{

  })
});
router.post('/register', [
  check('email')
  .notEmpty()
  .withMessage('邮箱不能为空'),
  check('password')
  .notEmpty()
  .withMessage('密码不能为空'),
], (req, res, next) => {
  
  var {errors} = validationResult(req);
  if(req.body.password !== req.body.confirmPassword){
    return res.send('两次密码不一样')
  }
  
  if(errors.length >=1){
      console.log(errors);
      return res.render('admin/user/register',req.body)
    }
    var user = new User({
      name:req.body.email.split('@').shift(),
      email:req.body.email,
      password:md5(req.body.password),
      created:new Date()
    })
    user.save(function(err,user){
      if(err){
        console.log(err);
        return next(err)
      }else{
        res.redirect('/admin/users/login')
      }
    })

});

router.get('/layout', (req, res, next) => {
  req.logout();
  res.redirect('/')
});