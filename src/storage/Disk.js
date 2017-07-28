const fs = require('fs');

class DiskStorageAdapter
{
  constructor(dir) {
    this.dir = dir;
  }

  path(id) {
    return this.dir + '/' + id;
  }

  getStream(id) {
    return fs.createReadStream(this.path(id));
  }

  putStream(input, id) {
    const output = fs.createWriteStream(this.path(id));
    return input.pipe(output);
  }
}

module.exports = DiskStorageAdapter;
