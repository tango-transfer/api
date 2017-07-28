const crypto = require('crypto');

function hash(stream, algo = 'sha1') {
  return new Promise(resolve => {
    const shasum = crypto.createHash(algo);
    let hash = '';
    stream.pipe(shasum)
    .on('data', digest => {
        hash += digest.toString('hex');
    })
    .on('end', () => {
        resolve(hash);
    });
  });
}

module.exports = hash;
