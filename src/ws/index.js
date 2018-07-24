const WebSocketServer = require('ws').Server;
const Client = require('./Client');

module.exports = function ws(server, coord) {
  const wss = new WebSocketServer({server, path: '/ws/monitor'});

  wss.on('connection', function connection(conn) {
    const client = new Client(conn);

    conn.on('message', function incoming(msg) {
      try {
        const payload = JSON.parse(msg);
        if (payload.type === 'CLAIM') {
          client.claims.add(payload.id);
          coord.claim(payload.id, payload.secret, client);
        }
      } catch (e) {
        console.error('Could not handle message', msg, e);
      }
    });

    conn.on('close', () => {
      client.claims.forEach(id => {
        coord.release(id, client);
      });
    });
  });

  return wss;
};