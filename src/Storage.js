const crypto = require('crypto');
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
    this.encrypt = encrypt;
    this.decrypt = decrypt;
  }

  createId() {
    return random.pretty(8, random.ALPHANUM);
  }

  createSecret() {
    return random.pretty(64, random.ALPHANUM);
  }

  cipher(secret) {
    return crypto.createCipher(this.algo, secret);
  }

  decipher(secret) {
    return crypto.createDecipher(this.algo, secret);
  }

  check(id, secret) {
    return this.meta(id, secret)
    .then(() => true)
    .catch(() => false);
  }
}

module.exports = Storage;
