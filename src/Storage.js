const fs = require('fs');
const crypto = require('crypto');
const uuid = require('uuid/v4');

const EmbedHeader = require('./stream/EmbedHeader');
const ExtractHeader = require('./stream/ExtractHeader');

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
    this.dir = '/tmp';
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
    return new Promise(res => {
      const decrypt = this.getDecipher('rohan');
      const path = this.path(id);
      const file = fs.createReadStream(path);
      res(file.pipe(decrypt));
    });
  }

  store(file) {
    const crypto = this.getCipher('rohan');
    const id = uuid();
    const path = this.path(id);
    const output = fs.createWriteStream(path);
    file.pipe(crypto).pipe(output);
    return new Promise(res => {
      res(id);
    });
  }
}

module.exports = Storage;
