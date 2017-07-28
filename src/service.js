const fs = require('fs');
const https = require('https');
const express = require('express');

const Coordinator = require('./Coordinator');
const GCS = require('@google-cloud/storage');
const DiskAdapter = require('./storage/Disk');
const GCSAdapter = require('./storage/GoogleCloud');
const Storage = require('./Storage');

const api = require('./api');
const ws = require('./ws');

const config = require(process.env.CONFIG || './config.json');

function createStore() {
  //return new Storage(new DiskAdapter(config.storage.dir));

  const storage = GCS({
    projectId: '141385452850',
    keyFilename: 'pomle-com-1d6cb19c34cb.json',
  });

  const bucket = storage.bucket('pomle-com.appspot.com');
  return new Storage(new GCSAdapter(bucket));
}

{
  const app = express();
  app.use('/', express.static('public'));

  const store = createStore();
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
