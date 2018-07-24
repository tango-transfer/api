const fs = require('fs');

function read(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
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
