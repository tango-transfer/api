const fs = require('fs');

class GoogleCloudAdapter
{
  constructor(bucket) {
    this.bucket = bucket;
  }

  getFile(id) {
    return this.bucket.file(id);
  }

  getStream(id) {
    return this.getFile(id).createReadStream();
  }

  putStream(input, id) {
    const output = this.getFile(id).createWriteStream();
    console.log(output);
    return input.pipe(output);
  }
}

module.exports = GoogleCloudAdapter;
