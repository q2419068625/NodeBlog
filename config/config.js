const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog-production'
  }
};

module.exports = config[env];
