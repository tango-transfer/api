const WebSocketServer = require('ws').Server;
const Client = require('./Client');

module.exports = function ws(server, coord) {
  const wss = new WebSocketServer({server, path: '/ws/monitor'});

  wss.on('connection', function connection(conn) {
    const client = new Client(conn);

    conn.on('message', function incoming(msg) {
      console.log(msg);
      const payload = JSON.parse(msg);
      if (payload.type === 'CLAIM') {
        client.claims.add(payload.id);
        coord.claim(payload.id, client);
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