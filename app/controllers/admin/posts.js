const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const slug = require('slug');
const auth = require('./user');
const {check,validationResult } = require('express-validator')
module.exports = (app) => {
  app.use('/admin/posts', router);
};

router.get('/',auth.requireLogin,  (req, res, next) => {
  var sortby = req.query.sortby ? req.query.sortby :'created'
  var sortdir = req.query.sortdir ? req.query.sortdir :'desc'

  if(['title','category','author','created','published'].indexOf(sortby) === -1){
    sortby = 'created'
  }
  if(['desc','asc'].indexOf(sortdir) === -1){
    sortdir = 'desc'
  }
  var sortObj = {}
  sortObj[sortby] = sortdir

  var conditions = {}
  if(req.query.keyword){
    conditions.title = new RegExp(req.query.keyword.trim(),'i') 
    conditions.content = new RegExp(req.query.keyword.trim(),'i') 
  }



  Post.find(conditions)
  .sort(sortObj)
  .populate('author')
  .populate('category')
  .exec((err,posts)=>{
      if (err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page || 1));
      var pageSize = 10;
      var totalCount = posts.length;
      var pageCount = Math.ceil(totalCount / pageSize);
      if(pageNum > pageCount){
          pageNum = pageCount;
      }
      res.render('admin/post/index', {
        posts: posts.slice((pageNum-1) * pageSize, pageNum * pageSize),
        pageNum:pageNum,
        pageCount:pageCount,
        sortdir:sortdir,
        sortby:sortby,
        filter:{
          keyword:req.query.keyword || ''
        }
      });
  });
});

router.get('/edit/:id',auth.requireLogin,  (req, res, next) => {
  if(!req.params.id){
    return next(new Error('no post id provided'))
}
var conditions = {};
try {
    conditions._id = mongoose.Types.ObjectId(req.params.id)
} catch (error) {
    conditions.slug = req.params.id
}
Post.findOne({_id:req.params.id})
.populate('category')
.populate('author')
.exec((err,posts)=>{
    if(err){
        return next(err)
    }
    res.render('admin/post/add',{
        posts:posts,
      action:'/admin/posts/edit/'+posts.id

    })
})
});

router.post('/edit/:id',auth.requireLogin,  (req, res, next) => {
  if(!req.params.id){
    return next(new Error('no post id provided'))
  }
  Post.findOne({_id:req.params.id}).exec((err,post)=>{
    if(err){
      return next(err)
    }
    var title = req.body.title.trim()
    var category = req.body.category.trim()
    var content = req.body.content

    post.title = title
    post.category = category
    post.content = content

    post.save((err,post)=>{
      if(err){
        console.log(err);
        return next(err)
      }else{
        res.redirect('/admin/posts')
      }
    })

  })
});

router.get('/add',auth.requireLogin,  (req, res, next) => {
  res.render('admin/post/add',{
    action:'/admin/posts/add',
    posts:{
      category:{_id:''}
    }
  });
});

router.post('/add',auth.requireLogin, [
      check('title')
      .notEmpty()
      .withMessage('文章标题不能为空'),

      check('category')
      .notEmpty()
      .withMessage('必须制定文章分类'),

      check('content')
      .notEmpty()
      .withMessage('文章内容至少写几句'),
], (req, res, next) => {
 

 var title = req.body.title.trim()
 var category = req.body.category.trim()
 var content = req.body.content

 var {errors} = validationResult(req);
  
  if(errors.length >=1){
      console.log(errors);
        return res.render('admin/post/add',{
        errors:errors,
        title:req.body.title,
        content:req.body.content
      })
    }

  User.findOne({},(err,author)=>{
    if(err){
      return next(err)
    }
    var post = new Post({
      title:title,
      slug:slug(title),
      category:category,
      content:content,
      author:author,
      published:true,
      meta:{favorite:0},
      comments:[],
      created:new Date()
    })
    post.save((err,post)=>{
      if(err){
        console.log(err);
        return next(err)
      }else{
        res.redirect('/admin/posts')
      }
    })
  })
});

router.get('/delete/:id',auth.requireLogin,  (req, res, next) => {
    if(!req.params.id){
        return next(new Error('no post id provided'))
    }
    Post.remove({_id:req.params.id}).exec((err,rowsRemoved)=>{
        if(err){
            return next(err)
        }
    })
    res.redirect('/admin/posts')
});