const fs = require('fs');
const file = require('./file');
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
    return file.read(path)
    .then(buffer => {
      const encrypted = buffer.toString();
      const decipher = this.decipher(secret);
      const json = this.decrypt(encrypted, decipher);
      return JSON.parse(json);
    });
  }

  putMeta(meta, path, secret) {
    const cipher = this.cipher(secret);
    const json = JSON.stringify(meta);
    const data = this.encrypt(json, cipher);
    const disk = fs.createWriteStream(path);
    disk.write(data);
    disk.end();
  }

  retrieve(id, secret) {
    const path = this.path(id);
    return this.getMeta(path + '.meta', secret)
    .then(meta => {
      const decipher = this.decipher(secret);
      const file = fs.createReadStream(path);
      return {
        meta,
        stream: file.pipe(decipher),
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
      const output = fs.createWriteStream(path);
      file.pipe(cipher).pipe(output);
    }

    return new Promise(res => {
      res({id, secret});
    });
  }
}

module.exports = DiskStorageAdapter;
