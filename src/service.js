const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const Coordinator = require('./Coordinator');
const Storage = require('./Storage');

const api = require('./api');
const ws = require('./ws');

const config = require(process.env.CONFIG || './config.json');

{
  const app = express();
  app.use('/', express.static('public'));

  const store = new Storage();
  store.dir = config.storage.dir || '/tmp';

  const coord = new Coordinator(store);

  app.use('/', api(app, coord));

  const options = {
    key: fs.readFileSync(config.https.key),
    cert: fs.readFileSync(config.https.cert),
  };

  const server = https.createServer(options, app);
  app.server = server;

  ws(server, coord);

  server.listen(config.https.port || 443);
  server.on('listening', () => {
      const bound = server.address();
      console.info(`HTTPS running on ${bound.address}:${bound.port}`);
  });
}
