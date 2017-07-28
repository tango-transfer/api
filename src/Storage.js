const crypto = require('crypto');
const {Readable} = require('stream');
const {consume} = require('./stream');
const random = require('./random');

class Storage
{
  constructor(adapter) {
    this.algo = 'aes-256-ctr';
    this.adapter = adapter;
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

  getMeta(id, secret) {
    return consume(this.readStream(id, secret))
    .then(json => JSON.parse(json));
  }

  putMeta(meta, id, secret) {
    const readable = new Readable();
    readable.push(Buffer.from(JSON.stringify(meta)));
    readable.push(null);
    return this.storeStream(readable, id, secret);
  }

  retrieve(id, secret) {
    return this.getMeta(id + '.meta', secret)
    .then(meta => {
      return {
        meta,
        stream: this.readStream(id, secret),
      }
    });
  }

  readStream(id, secret) {
    const decipher = this.decipher(secret);
    return this.adapter.getStream(id).pipe(decipher);
  }

  storeStream(input, id, secret) {
    const cipher = this.cipher(secret);
    return this.adapter.putStream(input.pipe(cipher), id);
  }

  store(file, meta) {
    const id = this.createId();
    const secret = this.createSecret();

    {
      let size = 0;
      file.on('data', data => {size += data.length});
      file.on('end', () => {
        meta.size = size;
        this.putMeta(meta, id + '.meta', secret);
      });
    }

    this.storeStream(file, id, secret);

    return new Promise(res => {
      res({id, secret});
    });
  }

  check(id, secret) {
    return this.meta(id, secret)
    .then(() => true)
    .catch(() => false);
  }
}

module.exports = Storage;
