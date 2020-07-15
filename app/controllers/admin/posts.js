const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const slug = require('slug');
const {check,validationResult } = require('express-validator')
module.exports = (app) => {
  app.use('/admin/posts', router);
};

router.get('/', (req, res, next) => {
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

  Post.find()
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
        sortby:sortby
      });
  });
});

router.get('/edit/:id', (req, res, next) => {
});

router.post('/edit/:id', (req, res, next) => {
});

router.get('/add', (req, res, next) => {
  res.render('admin/post/add');
});

router.post('/add',[
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

router.get('/delete/:id', (req, res, next) => {
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