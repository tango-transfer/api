const fs = require('fs');
const http = require('http');
const express = require('express');

const Coordinator = require('./Coordinator');
const {createStorage} = require('./storage');

const api = require('./api');
const ws = require('./ws');

{
  const app = express();
  app.use('/', express.static('public'));

  const storage = createStorage();
  const coord = new Coordinator(storage);

  app.use('/', api(app, coord));

  const server = http.createServer(app);
  app.server = server;

  ws(server, coord);

  server.listen(process.env.PORT || 8080);
  server.on('listening', () => {
      const bound = server.address();
      console.info(`HTTPS running on ${bound.address}:${bound.port}`);
  });
}
