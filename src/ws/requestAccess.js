function requestAccess(client, id, signature, timeout = 60) {
  return new Promise((resolve, reject) => {
    function unbind() {
      client.conn.removeListener('message', listener);
    }

    function listener(msg) {
      const payload = JSON.parse(msg);
      if (payload.type === 'ALLOW' && payload.id === id) {
        resolve(payload.secret);
        unbind();
      }
    }

    client.conn.on('message', listener);

    const msg = {
      type: 'REQUEST',
      id, signature, timeout,
    };

    client.send(msg);

    setTimeout(() => {
      reject(new Error('Timeout'));
      unbind();
    }, timeout * 1000);
  });
}

module.exports = requestAccess;
