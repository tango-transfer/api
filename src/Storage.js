const fs = require('fs');
const crypto = require('crypto');
const uuid = require('uuid/v4');

const MetaEmbedder = require('./MetaEmbedder');

function random() {
  return new Promise(resolve => {
    crypto.randomBytes(32, (err, buffer) => {
      resolve(buffer.toString('hex'));
    });
  });
}


class Storage
{
  constructor() {
    this.algo = 'aes-256-ctr';
    this.dir = '/tmp/otp-transmit';

    this.embedder = new MetaEmbedder();
  }

  getCipher(secret) {
    return crypto.createCipher(this.algo, secret);
  }

  getDecipher(secret) {
    return crypto.createDecipher(this.algo, secret);
  }

  path(id) {
    return this.dir + '/' + id;
  }

  retrieve(id) {
    const path = this.path(id);
    const stream = fs.createReadStream(path, 'binary');
    return this.embedder.extract(stream);
  }

  store(stream, contentType, name) {
    const meta = { contentType, name };
    return Promise.all([
      this.embedder.embed(stream, meta),
      uuid(),
      random(),
    ])
    .then(([stream, id, secret]) => {
      const path = this.path(id);
      const disk = fs.createWriteStream(path, 'binary');
      return new Promise(resolve => {
        stream.pipe(disk);
        disk.on('close', () => {
          resolve({id, secret});
        });
      });
    });
  }
}

module.exports = Storage;
