const expect = require('expect.js');

const fs = require('fs');

const EmbedHeader = require('../src/stream/EmbedHeader');
const ExtractHeader = require('../src/stream/ExtractHeader');
const hash = require('../src/hash');

describe('Embed / Extract', () => {
  context('when embedding', () => {
    [
      'binary',
      undefined,
    ].forEach(enc => {
      context(`using ${enc} encoding`, () => {
        const meta = {
          some_string_key: 415125,
          other_key: "string value",
          list: [1, 2, 'aga2'],
        };

        let embedded;

        beforeEach(() => {
            const readable = fs.createReadStream('./test/fixture/image.png', enc);
            const embed = new EmbedHeader(meta);
            embedded = readable.pipe(embed);
        });

        it('resulting stream has expected hash', (done) => {
          hash(embedded, 'sha1').then(digest => {
            expect(digest).to.be('d3f3a436f349a31dee7b8d015b835fe3eb7ae6cd');
          }).then(done).catch(done);
        });

        context('then extracting', () => {
          let extract, decoded;

          beforeEach(() => {
            extract = new ExtractHeader();
            decoded = embedded.pipe(extract);
          });

          it('retrieves expected data', (done) => {
            extract.on('decoded', extracted => {
              expect(extracted).to.eql(meta);
              done();
            });
          });

          it('decoded stream has expected hash', (done) => {
            hash(decoded, 'sha1').then(digest => {
              expect(digest).to.be('8f4e8178e595b15c062e2d6d1bc9cb25d1101a97');
            }).then(done).catch(done);
          });
        });
      });
    });
  });
});
