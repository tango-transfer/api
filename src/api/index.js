const express = require('express');
const busboy = require('connect-busboy');

module.exports = function api(coord) {
  const router = express.Router();

  router.get('/v1/blob/:id', (req, res) => {
    coord.request(req.params.id, req.query.sign).then(({meta, stream}) => {
      res.setHeader('Content-Length', meta.size);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-disposition', `filename="${meta.name}"`);
      stream.pipe(res);
    }).catch(err => {
      console.error(err.message);
      res.statusCode = 404;
      res.render('404');
    });
  });

  router.post('/v1/blob', busboy(), (req, res) => {
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

  return router;
}
