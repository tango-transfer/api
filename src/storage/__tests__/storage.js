const expect = require('expect.js');
const sinon = require('sinon');

const fs = require('fs');

const hash = require('../../hash');
const Storage = require('../Storage');
const DiskStorageAdapter = require('../adapters/Disk');
const CloudStorageAdapter = require('../adapters/GCS');

describe('Storage', () => {
  const MOCK_ID = 'Aa12xea2';
  let storage;

  function testStoreAndRetrieve() {
    describe('when storing file', () => {
      let storePromise, receipt;

      beforeEach(done => {
        // Start writing file.
        file = fs.createReadStream(__dirname + '/fixture/image.png');
        storePromise = storage.store(file, {
          mime: 'image/png',
          filename: 'other_filename.png',
        });

        storePromise.then(receipt => {
          receipt.streams.meta.then(stream => {
            stream.on('close', () => {
              // Done writing file.
              done();
            });
          });
        });
      });

      it('returns a Promise', () => {
        expect(storePromise).to.be.a(Promise);
      });

      describe('when resolved', () => {
        let receipt;

        beforeEach(() => {
          return storePromise.then(response => {
            receipt = response;
          });
        });

        it('contains a receipt', () => {
          expect(receipt).to.be.an(Object);
        });

        describe('Receipt', () => {
          it('contains file id', () => {
            expect(receipt.id).to.equal(MOCK_ID);
          });

          it('contains secret', () => {
            expect(receipt.secret.length).to.be(64);
          });

          it('contains streams', () => {
            expect(receipt.streams).to.be.ok();
          });

          describe('when used to retreive file', () => {
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
                expect(result.meta).to.be.an(Object);
              });

              describe('Meta', () => {
                let meta;

                beforeEach(() => {
                  meta = result.meta;
                });

                it('has mime type', () => {
                  expect(result.meta.mime).to.equal('image/png');
                });

                it('contains filename', () => {
                  expect(result.meta.filename).to.equal('other_filename.png');
                });

                it('contains filesize', () => {
                  expect(result.meta.size).to.equal(159021);
                });
              });

              it('contains stream with expected data', () => {
                return hash(result.stream, 'sha1').then(digest => {
                  expect(digest).to.be('8f4e8178e595b15c062e2d6d1bc9cb25d1101a97');
                });
              });
            });
          });
        });
      });
    });
  }

  describe('Local Disk', () => {
    beforeEach(() => {
      storage = new Storage(new DiskStorageAdapter('/tmp'));
      sinon.stub(storage, 'createId').callsFake(() => MOCK_ID);
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
