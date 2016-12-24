const ExtractHeader = require('./src/stream/ExtractHeader');

const crypto = require('crypto');
const fs = require('fs');
const CombinedStream = require('combined-stream');
const split = require('split');
const readline = require('readline');


const cipher = crypto.createCipher('aes-256-ctr', 'apa');
const decipher = crypto.createDecipher('aes-256-ctr', 'apa');


function encode(data, inputFile, outputFile) {
  return new Promise(resolve => {
    const json = JSON.stringify(data);
    const input = fs.createReadStream(inputFile, 'binary');

    const stream = CombinedStream.create();

    stream.append(json + '\n');
    stream.append(input);

    const output = fs.createWriteStream(outputFile, 'binary');
    stream.pipe(output);

    output.on('close', resolve);
  });
}

function decode(inputFile, outputFile) {
  return new Promise(resolve => {
    const input = fs.createReadStream(inputFile, 'binary');
    const output = fs.createWriteStream(outputFile, 'binary');

    const header = new ExtractHeader('binary');
    header.on('decoded', data => {
      console.log(data);
    });

    input.pipe(header).pipe(output);
  });
}

encode({a: 1, b: 2}, 'test.png', 'combined')
.then(() => {
  console.log('Encode done');
  return decode('combined', 'decoded.png')
})
.then(data => {
  console.log(data);
});


