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

  meta(id, secret) {
    const path = this.path(id);
    return file.read(path + '.meta')
    .then(buffer => {
      const encrypted = buffer.toString();
      const decipher = this.decipher(secret);
      const json = this.decrypt(encrypted, decipher);
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
    const id = this.createId();
    const secret = this.createSecret();
    const path = this.path(id);

    {
      let size = 0;
      file.on('data', data => {size += data.length});
      file.on('end', () => {
        meta.size = size;
        const cipher = this.cipher(secret);
        const json = JSON.stringify(meta);
        const data = this.encrypt(json, cipher);
        const disk = fs.createWriteStream(path + '.meta');
        disk.write(data);
        disk.end();
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
