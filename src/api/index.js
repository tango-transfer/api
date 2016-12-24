const express = require('express');
const busboy = require('connect-busboy');
const Storage = require('../Storage');

const router = express.Router();

const fs = require('fs');


const storage = new Storage();


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

module.exports = router;
