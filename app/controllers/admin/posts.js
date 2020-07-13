const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');

module.exports = (app) => {
  app.use('/admin/posts', router);
};

router.get('/', (req, res, next) => {
  Post.find()
  .sort('created')
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
      });
  });
});

router.get('/edit/:id', (req, res, next) => {
});

router.post('/edit/:id', (req, res, next) => {
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