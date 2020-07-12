const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');

module.exports = (app) => {
  app.use('/admin', router);
};

router.get('/', (req, res, next) => {
  Post.find((err, posts) => {
    if (err) return next(err);
    res.render('admin/index', {
      title: 'Node Blog Admin',
      posts: posts
    });
  });
});