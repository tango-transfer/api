const CombinedStream = require('combined-stream');
const ExtractHeader = require('./stream/ExtractHeader');

class MetaEmbedder
{
  embed(input, data) {
    return new Promise(resolve => {
      const json = JSON.stringify(data);
      const stream = CombinedStream.create();
      stream.append(json + '\n');
      stream.append(input);
      resolve(stream);
    });
  }

  extract(stream) {
    return new Promise(resolve => {
      const header = new ExtractHeader();
      header.on('decoded', data => {
        resolve([piped, data]);
      });
      const piped = stream.pipe(header);
    });
  }
}

module.exports = MetaEmbedder;
