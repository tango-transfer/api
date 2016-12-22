const express = require('express');
const request = require('request');
const router = express.Router();

const FileArchive = require('../FileArchive');

const archive = new FileArchive();

const listeners = new Map();
const secrets = new Map();

function requestPermission(id, owners) {
}

router.get('/v1/blob/:id', (req, res) => {
  const id = req.params.id;

  const owners = listeners.get(id);

  owners.forEach(owner => {


  })

  const secret = secrets.get(id);

  archive.requestFile(id).then(file => {
    req.send(file);
  }).catch(err => {
    req.status = 401;
  });
});

router.post('/v1/blob', (req, res) => {
  const id = getRandomFileName();
  const secret = getSecret();

  secrets.set(id, secret);

  archive.store(id, request.file_data)
    .then(receipt => res.send(receipt);
});

module.exports = router;
