const express = require('express');

module.exports = function ui(app) {
  app.set('views', './ui/templates');
  app.set('view engine', 'ejs');

  const router = express.Router();

  router.get('/dispatch/:id/:secret', (req, res) => {
    res.locals = {
      receipt: JSON.stringify(req.params),
    };

    res.render('dispatch');
  });

  app.use(router);
}
