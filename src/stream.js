function consume(stream) {
  return new Promise(resolve => {
    let data = '';
    stream.on('data', buffer => {
      data += buffer.toString();
    });
    stream.on('end', () => {
      resolve(data);
    });
  });
}

module.exports = {
    consume,
};
