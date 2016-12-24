const fs = require('fs');
const crypto = require('crypto');
const uuid = require('uuid/v4');

const EmbedHeader = require('./stream/EmbedHeader');
const ExtractHeader = require('./stream/ExtractHeader');

const file = require('./file');

function random() {
  return new Promise(resolve => {
    crypto.randomBytes(32, (err, buffer) => {
      resolve(buffer.toString('hex'));
    });
  });
}

function decrypt(str, decipher) {
  let dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function encrypt(str, cipher) {
  let enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}


class Storage
{
  constructor() {
    this.algo = 'aes-256-ctr';
    this.dir = '/tmp';
  }

  cipher(secret) {
    return crypto.createCipher(this.algo, secret);
  }

  decipher(secret) {
    return crypto.createDecipher(this.algo, secret);
  }

  path(id) {
    return this.dir + '/' + id;
  }

  retrieve(id) {
    const path = this.path(id);
    const secret = 'rohan';

    return file.read(path + '.meta')
    .then(buffer => {
      const encrypted = buffer.toString();
      const decipher = this.decipher(secret);
      const json = decrypt(encrypted, decipher);
      console.log(encrypted, json);
      return JSON.parse(json);
    })
    .then(meta => {

      const decipher = this.decipher(secret);
      const file = fs.createReadStream(path);
      return file.pipe(decipher);
    });
  }

  store(file, meta) {
    const id = uuid();
    const path = this.path(id);

    const secret = 'rohan';

    {
      const cipher = this.cipher(secret);
      const json = JSON.stringify(meta);
      const data = encrypt(json, cipher);
      const disk = fs.createWriteStream(path + '.meta');
      disk.write(data);
      disk.end();
    }

    {
      const cipher = this.cipher(secret);
      const output = fs.createWriteStream(path);
      file.pipe(cipher).pipe(output);
    }

    return new Promise(res => {
      res(id);
    });
  }
}

module.exports = Storage;
