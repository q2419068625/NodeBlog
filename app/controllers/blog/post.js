const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');

module.exports = (app) => {
  app.use('/posts', router);
};

router.get('/', (req, res, next) => {
    var conditions = {published:true}
    if(req.query.keyword){
        conditions.title = new RegExp(req.query.keyword.trim(),'i') 
        conditions.content = new RegExp(req.query.keyword.trim(),'i') 
    }

  Post.find(conditions)
  .sort('-created')
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
      res.render('blog/index', {
        posts: posts.slice((pageNum-1) * pageSize, pageNum * pageSize),
        pageNum:pageNum,
        pageCount:pageCount
      });
  });
});

router.get('/category/:name', (req, res, next) => {
    Category.findOne({name:req.params.name}).exec((err,category)=>{
        if(err){
            return next(err);
        }
        Post.find({category:category,published:true})
        .sort('created')
        .populate('category')
        .populate('author')
        .exec((err,posts)=>{
            if(err){
                return next(err);
            }
            var pageNum = Math.abs(parseInt(req.query.page || 1));
            var pageSize = 10;
            var totalCount = posts.length;
            var pageCount = Math.ceil(totalCount / pageSize);
            if(pageNum > pageCount){
                pageNum = pageCount;
            }
            res.render('blog/category',{
                category:category,
                posts: posts.slice((pageNum-1) * pageSize, pageNum * pageSize),
                pageNum:pageNum,
                pageCount:pageCount,
            })
        })
    })
});

router.get('/view/:id', (req, res, next) => {
    if(!req.params.id){
        return next(new Error('no post id provided'))
    }
    var conditions = {};
    try {
        conditions._id = mongoose.Types.ObjectId(req.params.id)
    } catch (error) {
        conditions.slug = req.params.id
    }
    Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec((err,posts)=>{
        if(err){
            return next(err)
        }
        res.render('blog/view',{
            posts:posts,
        })
    })
});


router.get('/favourite/:id', (req, res, next) => {
    if(!req.params.id){
        return next(new Error('no post id provided'))
    }
    var conditions = {};
    try {
        conditions._id = mongoose.Types.ObjectId(req.params.id)
    } catch (error) {
        conditions.slug = req.params.id
    }
    Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec((err,posts)=>{
        if(err){
            return next(err)
        }
        posts.meta.favorites = posts.meta.favorites ? posts.meta.favorites + 1 : 1;
        posts.markModified('meta');
        posts.save((err)=>{
            res.redirect('/posts/view/' + posts.slug)
        })
       
    })
});

router.post('/comment/:id', (req, res, next) => {

    if(!req.body.email){
        return next(new Error('no email'))
    }
    if(!req.body.content){
        return next(new Error('no content'))
    }
    var conditions = {};
    try {
        conditions._id = mongoose.Types.ObjectId(req.params.id)
    } catch (error) {
        conditions.slug = req.params.id
    }
    Post.findOne(conditions).exec((err,posts)=>{
        if(err){
            return next(err)
        }
        var comment = {
            email:req.body.email,
            content:req.body.content
        }
        posts.comments.unshift(comment)
        posts.markModified('comments')
        posts.save((err,posts)=>{
            res.redirect('/posts/view/'+posts.slug)
        })
    })
});

