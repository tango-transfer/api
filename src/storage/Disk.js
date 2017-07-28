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
    return fs.createReadStream(this.getPath(id));
  }

  putStream(input, id) {
    const output = fs.createWriteStream(this.getPath(id));
    return input.pipe(output);
  }
}

module.exports = DiskStorageAdapter;
