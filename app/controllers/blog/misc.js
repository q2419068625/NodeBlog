const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');

module.exports = (app) => {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
  res.redirect('/posts')
});

router.get('/about', (req, res, next) => {
    res.render('blog/index', {
      title: 'About me',
    });
});
router.get('/contact', (req, res, next) => {
    res.render('blog/index', {
      title: 'Contact me',
    });
});
