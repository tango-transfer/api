const fs = require('fs');
const {Readable} = require('stream');
const BaseStorageAdapter = require('../Storage');

function consume(stream) {
  return new Promise(resolve => {
    let data = '';
    stream.on('data', buffer => {
      data += buffer.toString();
    });
    stream.on('end', () => {
      resolve(data);
    });
  });
}

class DiskStorageAdapter extends BaseStorageAdapter
{
  constructor(dir) {
    super();
    this.dir = dir;
  }

  path(id) {
    return this.dir + '/' + id;
  }

  readStream(path, secret) {
    const decipher = this.decipher(secret);
    return fs.createReadStream(path).pipe(decipher);
  }

  storeStream(input, path, secret) {
    const cipher = this.cipher(secret);
    const output = fs.createWriteStream(path);
    return input.pipe(cipher).pipe(output);
  }

  getMeta(path, secret) {
    return consume(this.readStream(path, secret))
    .then(json => JSON.parse(json));
  }

  putMeta(meta, path, secret) {
    const readable = new Readable();
    readable.push(Buffer.from(JSON.stringify(meta)));
    readable.push(null);
    return this.storeStream(readable, path, secret);
  }

  retrieve(id, secret) {
    const path = this.path(id);
    return this.getMeta(path + '.meta', secret)
    .then(meta => {
      return {
        meta,
        stream: this.readStream(path, secret),
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

    this.storeStream(file, path, secret);

    return new Promise(res => {
      res({id, secret});
    });
  }
}

module.exports = DiskStorageAdapter;
