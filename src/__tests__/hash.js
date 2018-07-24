const expect = require('expect.js');

const fs = require('fs');
const hash = require('../hash');

function open(path) {
  return fs.createReadStream(path, 'binary');
}

describe('Hash', () => {
  context('when given stream of known image', () => {
    let readstream;

    beforeEach(() => {
      readstream = open(__dirname + '/fixture/image.png');
    });

    [
      ['sha1', '8f4e8178e595b15c062e2d6d1bc9cb25d1101a97'],
      ['md5', '59e1f4e50b4369ebfe6a475e20675614'],
    ].forEach(([algo, expected]) => {
      it(`correctly calculates ${algo}`, (done) => {
        hash(readstream, algo).then(digest => {
          expect(digest).to.be(expected);
        }).then(done).catch(done);
      });
    });
  });
});
