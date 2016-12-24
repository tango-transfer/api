const express = require('express');
const random = require('../random');

module.exports = function ui(app) {
  app.set('views', './ui/templates');
  app.set('view engine', 'ejs');

  const router = express.Router();

  router.get('/', (req, res) => {
    res.setHeader('Location', '/upload');
    res.statusCode = 302;
    res.end();
  });

  router.get('/upload', (req, res) => {
    res.render('upload');
  });

  router.get('/dispatch/:id/:secret', (req, res) => {
    res.locals = {
      filename: req.query.name,
      receipt: req.params,
    };

    res.render('dispatch');
  });

  router.get('/file/:id', (req, res) => {
    res.locals = {
      sign: random.pretty(5),
      fileId: req.params.id,
    };

    res.render('download');
  });

  router.use((req, res) => {
    res.statusCode = 404;
    res.render('404');
  });

  app.use(router);
}
