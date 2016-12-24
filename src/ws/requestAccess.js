function requestAccess(client, id, signature, timeout = 60) {
  return new Promise((resolve, reject) => {
    function done() {
      clearTimeout(timer);
      client.conn.removeListener('message', listener);
    }

    function listener(msg) {
      const payload = JSON.parse(msg);
      if (payload.type === 'ALLOW' && payload.id === id) {
        done();
        resolve(payload.secret);
      }
    }

    client.conn.on('message', listener);

    const msg = {
      type: 'REQUEST',
      id, signature, timeout,
    };

    client.send(msg);

    const timer = setTimeout(() => {
      reject(new Error('Timeout'));
      done();
    }, timeout * 1000);
  });
}

module.exports = requestAccess;
