const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');
const {check,validationResult } = require('express-validator')
const slug = require('slug');
const auth = require('./user');
module.exports = (app) => {
  app.use('/admin/categories', router);
};

router.get('/',auth.requireLogin, (req, res, next) => {
    res.render('admin/category/index', {
      });
});

router.get('/add',auth.requireLogin, (req, res, next) => {
    res.render('admin/category/add', {
      category:{
          _id:'',
      },
      action:'/admin/categories/add',
      posts:{}
    });
});

router.post('/add',auth.requireLogin, [
  check('name')
  .notEmpty()
  .withMessage('分类标题不能为空'),
],(req, res, next) => {
 var name = req.body.name.trim()
 var {errors} = validationResult(req);
  
  if(errors.length >=1){
      console.log(errors);
        return res.render('admin/category/add',{
        errors:errors,
        name:req.body.name
      })
    }
    var category = new Category({
      name:name,
      slug:slug(name),
      created:new Date()
    })
    category.save((err,category)=>{
      if(err){
        console.log(err);
        return next(err)
      }else{
        res.redirect('/admin/categories')
      }
    })

});

router.get('/edit/:id',auth.requireLogin, (req, res, next) => {
  if(!req.params.id){
    return next(new Error('no post id provided'))
}
Category.findOne({_id:req.params.id})
.exec((err,category)=>{
    if(err){
        return next(err)
    }
    res.render('admin/category/add',{
      category:category,
      action:'/admin/categories/edit/'+ category._id,
    })


})

});

router.post('/edit/:id', auth.requireLogin,(req, res, next) => {
  if(!req.params.id){
    return next(new Error('no post id provided'))
  }

  Category.findOne({_id:req.params.id}).exec((err,category)=>{
    if(err){
      return next(err)
    }
    var name = req.body.name.trim()

    category.name = name
    category.save((err,category)=>{
      if(err){
        console.log(err);
        return next(err)
      }else{
        res.redirect('/admin/categories')
      }
    })

  })
  
});


router.get('/delete/:id',auth.requireLogin, (req, res, next) => {

  if(!req.params.id){
    return next(new Error('no post id provided'))
}
    Category.remove({_id:req.params.id}).exec((err,rowsRemoved)=>{
      if(err){
          return next(err)
      }
  })
  res.redirect('/admin/categories')
});