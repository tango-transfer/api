const expect = require('expect.js');
const DiskAdapter = require('../Disk');

describe('DiskAdapter', () => {
    describe('on instantiation', () => {
        let adapter;

        beforeEach(() => {
            adapter = new DiskAdapter('/tmp/');
        });

        describe('#getStream', () => {
            describe('when file does not exist', () => {
                let stream, error;

                beforeEach(done => {
                    stream = adapter.getStream('nonexistent.file');
                    stream.on('error', e => {
                        error = e;
                        done();
                    });
                });

                it('returns a readable stream', () => {
                    expect(stream.read).to.be.a(Function);
                });

                it('emits error event', () => {
                    expect(error).to.be.an(Error);
                });
            });
        });
    });
});
