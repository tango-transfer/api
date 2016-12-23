const express = require('express');
const busboy = require('connect-busboy');
const Storage = require('../Storage');

const router = express.Router();

const fs = require('fs');


router.get('/v1/blob/:id', (req, res) => {
  res.setHeader("content-type", "image/png");
  fs.createReadStream('/tmp/upload').pipe(res);
});

router.post('/v1/blob', busboy(), (req, res) => {
  if (req.busboy) {
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const output = fs.createWriteStream('/tmp/upload');
      file.pipe(output).on('finish', () => res.end());
    });
    req.pipe(req.busboy);
  }
});

module.exports = router;
