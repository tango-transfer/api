const crypto = require('crypto');

function hash(stream, algo) {
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash(algo);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk, 'binary'));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

module.exports = hash;
