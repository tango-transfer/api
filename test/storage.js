const expect = require('expect.js');

const fs = require('fs');
const crypto = require('crypto');

const hash = require('../src/hash');
const Storage = require('../src/Storage');


describe('Storage', () => {
  let storage;

  beforeEach(() => {
    storage = new Storage();
    storage.dir = '/tmp';
  });

  context('when storing file to disk', () => {
    let storePromise;

    beforeEach(() => {
      const file = fs.createReadStream('./test/fixture/image.png', 'binary');
      storePromise = storage.store(file, 'image/png', 'other_filename.png');
    });

    it('returns a thenable', () => {
      expect(storePromise.then).to.be.a('function');
    });

    it('resolves new file id', (done) => {
      storePromise.then(response => {
        expect(response.receipt.id).to.match(/[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/);
      }).then(done).catch(done);
    });

    it('resolves stream that can be waited for', (done) => {
      storePromise.then(receipt => {
        receipt.stream.on('finish', done);
      }).catch(done);
    });

    context('then retreiving file using receipt id', () => {
      let retreivePromise;

      beforeEach((done) => {
        storePromise.then(response => {
          return new Promise(r => {
            response.stream.on('finish', () => r(response.receipt));
          });
        })
        .then(receipt => {
          retreivePromise = storage.retrieve(receipt.id);
        }).then(done).catch(done);
      });

      it('returns a thenable', () => {
        expect(retreivePromise.then).to.be.a('function');
      });

      it('resolves with meta', (done) => {
        retreivePromise.then(({meta}) => {
          expect(meta.contentType).to.be('image/png');
          expect(meta.name).to.be('other_filename.png');
        }).then(done).catch(done);
      });

      it('resolves stream with expected data', (done) => {
        retreivePromise.then((payload) => {
          hash(payload.stream, 'sha1').then(digest => {
            expect(digest).to.be('8f4e8178e595b15c062e2d6d1bc9cb25d1101a97');
          }).then(done).catch(done);
        });
      });
    });
  });
});
