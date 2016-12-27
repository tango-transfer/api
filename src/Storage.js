const fs = require('fs');
const crypto = require('crypto');
const file = require('./file');
const random = require('./random');


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

  check(id, secret) {
    return this.meta(id, secret)
    .then(() => true)
    .catch(() => false);
  }

  meta(id, secret) {
    const path = this.path(id);
    return file.read(path + '.meta')
    .then(buffer => {
      const encrypted = buffer.toString();
      const decipher = this.decipher(secret);
      const json = decrypt(encrypted, decipher);
      return JSON.parse(json);
    })
    .then(meta => {
      const stats = fs.statSync(path);
      meta.size = stats.size;
      return meta;
    });
  }

  retrieve(id, secret) {
    return this.meta(id, secret)
    .then(meta => {
      const decipher = this.decipher(secret);
      const path = this.path(id);
      const file = fs.createReadStream(path);
      return {
        meta,
        stream: file.pipe(decipher),
      }
    });
  }

  store(file, meta) {
    const id = random.pretty(8, random.ALPHANUM);
    const path = this.path(id);

    const secret = random.pretty(64, random.ALPHANUM);

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
      res({id, secret});
    });
  }
}

module.exports = Storage;
