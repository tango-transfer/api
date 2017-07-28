const fs = require('fs');
const file = require('./file');
const {Readable} = require('stream');
const BaseStorageAdapter = require('../Storage');

class DiskStorageAdapter extends BaseStorageAdapter
{
  constructor(dir) {
    super();
    this.dir = dir;
  }

  path(id) {
    return this.dir + '/' + id;
  }

  getMeta(path, secret) {
    return new Promise(resolve => {
      const input = fs.createReadStream(path);
      const decipher = this.decipher(secret);
      const string = input.pipe(decipher);
      let json = '';
      string.on('data', buffer => json += buffer.toString());
      string.on('end', () => {
        resolve(JSON.parse(json));
      });
    });
  }

  putMeta(meta, path, secret) {
    const cipher = this.cipher(secret);
    const json = JSON.stringify(meta);
    const readable = new Readable();
    const stream = fs.createWriteStream(path);
    readable.pipe(cipher).pipe(stream);
    readable.push(Buffer.from(json));
    readable.push(null);
  }

  retrieve(id, secret) {
    const path = this.path(id);
    return this.getMeta(path + '.meta', secret)
    .then(meta => {
      const decipher = this.decipher(secret);
      const stream = fs.createReadStream(path);
      return {
        meta,
        stream: stream.pipe(decipher),
      }
    });
  }

  store(file, meta) {
    const id = this.createId();
    const secret = this.createSecret();
    const path = this.path(id);

    {
      let size = 0;
      file.on('data', data => {size += data.length});
      file.on('end', () => {
        meta.size = size;
        this.putMeta(meta, path + '.meta', secret);
      });
    }

    {
      const cipher = this.cipher(secret);
      const stream = fs.createWriteStream(path);
      file.pipe(cipher).pipe(stream);
    }

    return new Promise(res => {
      res({id, secret});
    });
  }
}

module.exports = DiskStorageAdapter;
