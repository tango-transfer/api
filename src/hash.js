const crypto = require('crypto');

function hash(stream, algo = 'sha1') {
  return new Promise(resolve => {
    const shasum = crypto.createHash(algo);
    stream.pipe(shasum).on('data', digest => {
      resolve(digest.toString('hex'));
    });
  });
}

module.exports = hash;
