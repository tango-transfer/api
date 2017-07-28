function consume(stream, enc = 'utf8') {
  return new Promise(resolve => {
    let data = '';
    stream.on('data', buffer => {
      data += buffer.toString(enc);
    });
    stream.on('end', () => {
      resolve(data);
    });
  });
}

module.exports = {
    consume,
};
