const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = mongoose.model('Article');

module.exports = (app) => {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
  Article.find((err, articles) => {
    if (err) return next(err);
    res.render('blog/index', {
      title: 'Node Blog Home',
      articles: articles
    });
  });
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
