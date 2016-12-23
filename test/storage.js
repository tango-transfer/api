const expect = require('expect.js');

const fs = require('fs');
const crypto = require('crypto');

const EmbedHeader = require('../src/stream/EmbedHeader');
const Storage = require('../src/Storage');

function sha1(stream) {
  return new Promise(resolve => {
    const shasum = crypto.createHash('sha1');
    stream.on('data', buf => shasum.update(buf));
    stream.on('end', () => resolve(shasum.digest('hex')));
  });
}

describe('Storage', () => {
  let storage;

  beforeEach(() => {
    storage = new Storage();
    storage.dir = '/tmp';
  });

  it('encodes data in a file and retrieves it', (done) => {
    const embed = new EmbedHeader();

    const stream = fs.createReadStream('./test2.png');
    const embedded = stream.pipe(embed);

    sha1(embedded).then(digest => {
      expect(digest).to.be('f7d27690d46b96abe12210ff14363fcc3dda8784');
    }).then(done).catch(done);
  });


  context.skip('when storing file to disk', () => {
    let promise;

    beforeEach(() => {
      const file = fs.createReadStream('./test/fixture/test.png', 'binary');
      promise = storage.store(file, 'image/png', 'other_filename.png');
    });

    it('returns a thenable', () => {
      expect(promise.then).to.be.a('function');
    });

    it('returns promise that resolves with receipt', (done) => {
      promise.then(receipt => {
        expect(receipt.id).to.be.ok();
        expect(receipt.secret).to.be.ok();;
      }).then(done).catch(done);
    });

    context('then retreiving file using receipt id', () => {
      beforeEach((done) => {
        promise.then(receipt => {
          promise = storage.retrieve(receipt.id);
        }).then(done).catch(done);
      });

      it('returns a thenable', () => {
        expect(promise.then).to.be.a('function');
      });

      it('resolves with written metadata', (done) => {
        promise.then(([pass, meta]) => {
          expect(meta.contentType).to.be('image/png');
          expect(meta.name).to.be('other_filename.png');
        }).then(done).catch(done);
      });

      it('resolves stream with expected data', (done) => {

      });

    });
  });
});
