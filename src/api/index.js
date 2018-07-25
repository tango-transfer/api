const express = require('express');
const busboy = require('connect-busboy');
const random = require('../random');

module.exports = function api(app, coord) {
  app.set('views', './templates');
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

  router.get('/dispatch/:id', (req, res) => {
    res.locals = {
      filename: req.query.name,
      id: req.params.id,
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

  router.get('/file/:id/download', (req, res) => {
    const id = req.params.id;
    coord.request(id, req.query.sign).then(({meta, stream}) => {
      res.setHeader('Content-Length', meta.size);
      res.setHeader('Content-Type', meta.mime);
      res.setHeader('Content-Disposition', `attachment; filename="${meta.name}"`);
      res.setHeader('X-Filename', meta.name);
      stream.pipe(res);
    }).catch(err => {
      console.error(err.message);
      res.statusCode = 404;
      res.setHeader('Location', `/file/${id}/declined`);
      res.end();
    });
  });

  router.post('/file', busboy(), (req, res) => {
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        const store = coord.store;
        store.store(file, { mime: mimetype, name: filename }).then(receipt => {
          res.end(JSON.stringify(receipt));
        });
      });
      req.pipe(req.busboy);
    }
  });

  router.use((req, res) => {
    res.statusCode = 404;
    res.render('404');
  });

  return router;
}
