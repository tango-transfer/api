const express = require('express');

const busboy = require('connect-busboy');

module.exports = function api(storage) {
  const router = express.Router();

  router.get('/v1/blob/:id/:secret', (req, res) => {
    storage.retrieve(req.params.id, req.params.secret).then(({meta, stream}) => {
      res.setHeader("content-type", meta.mime);
      res.setHeader("filename", meta.name);
      stream.pipe(res);
    });
  });

  router.post('/v1/blob', busboy(), (req, res) => {
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        storage.store(file, { mime: mimetype, name: filename }).then(receipt => {
          res.end(JSON.stringify(receipt));
        });
      });
      req.pipe(req.busboy);
    }
  });

  return router;
}
