const fs = require('fs');

class DiskStorageAdapter
{
  constructor(dir) {
    this.dir = dir;
  }

  getPath(id) {
    return this.dir + '/' + id;
  }

  getStream(id) {
    const path = this.getPath(id);
    return fs.createReadStream(path);
  }

  putStream(input, id) {
    const path = this.getPath(id);
    const output = fs.createWriteStream(path);
    return input.pipe(output);
  }
}

module.exports = DiskStorageAdapter;
