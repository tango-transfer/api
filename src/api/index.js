const express = require('express');
const busboy = require('connect-busboy');
const Storage = require('../Storage');

const router = express.Router();

const fs = require('fs');


const storage = new Storage();


router.get('/v1/blob/:id', (req, res) => {
  const file = storage.retrieve(req.params.id);
  res.setHeader("content-type", "image/png");
  file.pipe(res);
});

router.post('/v1/blob', busboy(), (req, res) => {
  if (req.busboy) {
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const id = storage.store(file);
      res.end(id);
    });
    req.pipe(req.busboy);
  }
});

module.exports = router;
