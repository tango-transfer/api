const expect = require('expect.js');

const fs = require('fs');
const GCS = require('@google-cloud/storage');

const hash = require('../src/hash');
const Storage = require('../src/Storage');
const DiskStorageAdapter = require('../src/storage/Disk');
const CloudStorageAdapter = require('../src/storage/GoogleCloud');

describe('Storage', () => {
  let storage;

  function testStoreAndRetrieve() {
    describe('when storing file', () => {
      let storePromise, receipt;

      beforeEach(() => {
        file = fs.createReadStream('./test/fixture/image.png', 'binary');
        storePromise = storage.store(file, {
          mime: 'image/png',
          filename: 'other_filename.png',
        });
      });

      it('returns a Promise', () => {
        expect(storePromise).to.be.a(Promise);
      });

      describe('when resolved', () => {
        beforeEach(() => {
          return storePromise.then(response => {receipt = response});
        });

        describe('receipt', () => {
          it('contains file id', () => {
            expect(receipt.id.length).to.be(8);
          });

          it('contains secret', () => {
            expect(receipt.secret.length).to.be(64);
          });
        });
      });

      context('then retreiving file using receipt id', () => {
        let retreivePromise;

        beforeEach(() => {
          retreivePromise = storage.retrieve(receipt.id, receipt.secret);
        });

        it('returns a Promise', () => {
          expect(retreivePromise).to.be.a(Promise);
        });

        describe('when resolved', () => {
          let result;

          beforeEach(() => {
            return retreivePromise.then(_r => {result = _r});
          });

          it('contains meta', () => {
            expect(result.meta.mime).to.equal('image/png');
            expect(result.meta.filename).to.equal('other_filename.png');
            expect(result.meta.size).to.equal(159021);
          });

          it('contains stream with expected data', (done) => {
            hash(result.stream, 'sha1').then(digest => {
              expect(digest).to.be('8f4e8178e595b15c062e2d6d1bc9cb25d1101a97');
            }).then(done).catch(done);
          });
        });
      });
    });
  }

  describe('Local Disk', () => {
    beforeEach(() => {
      storage = new Storage(new DiskStorageAdapter('/tmp'));
    });

    describe('Store and Retrieve', testStoreAndRetrieve);
  });

  describe.skip('Google Cloud Storage', () => {
    let bucket;

    before(() => {
      const storage = GCS({
        projectId: '141385452850',
      });
      bucket = storage.bucket('pomle-com.appspot.com');
    });

    beforeEach(() => {
      storage = new Storage(new CloudStorageAdapter(bucket));
    });

    describe('Store and Retrieve', testStoreAndRetrieve);
  });
});
