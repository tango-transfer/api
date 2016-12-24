const fs = require('fs');

function read(path) {
  return new Promise(resolve => {
    fs.readFile(path, (err, data) => {
      if (err) {
        throw err;
      }
      resolve(data);
    });
  });
}

function write(path, data) {
  return new Promise(resolve => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        throw err;
      }
      resolve();
    });
  });
}

module.exports = {
  read,
  write,
};
