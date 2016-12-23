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
    this.dir = '/tmp/otp-transmit';
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
    return new Promise(resolve => {
      const path = this.path(id);
      const disk = fs.createReadStream(path, 'binary');
      const extract = new ExtractHeader();
      extract.on('decoded', meta => {
        resolve({
          meta,
          stream: decoded,
        });
      });
      const decoded = disk.pipe(extract);
    });
  }

  store(readable, contentType, name) {
    const meta = { contentType, name };
    const embed = new EmbedHeader(meta);

    return Promise.all([
      uuid(),
      random(),
    ])
    .then(([id]) => {
      const path = this.path(id);
      const disk = fs.createWriteStream(path, 'binary');

      return {
        id,
        stream: readable.pipe(embed).pipe(disk),
      }
    });
  }
}

module.exports = Storage;
