const express = require('express');
const busboy = require('connect-busboy');
const Storage = require('../Storage');

const router = express.Router();


const storage = new Storage();


router.get('/v1/blob/:id', (req, res) => {
  const id = req.params.id;

  storage.requestFile(id).then(file => {
    res.setHeader('content-type', file.contentType);
    res.setHeader('filename', file.name);
    file.pipe(res);
  }).catch(err => {
    req.statusCode = 403;
  });
});

router.post('/v1/blob', busboy(), (req, res) => {
  if (req.busboy) {
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

      storage.store(file).then(receipt => {
        res.send(JSON.stringify(receipt));
      });

    });

    req.busboy.on('finish', function() {
      console.log('done');
    });

    req.pipe(req.busboy);
  }
});

module.exports = router;
