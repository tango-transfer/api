const fs = require('fs');
const https = require('https');
const express = require('express');

const Coordinator = require('./Coordinator');
const Storage = require('./Storage');
const api = require('./api');
const ui = require('./ui');
const ws = require('./ws');

const config = require(process.env.CONFIG || './config.json');

const app = express();
app.use('/', express.static('public'));

const store = new Storage();
store.dir = process.env.STORAGE_DIR || '/tmp';

const coord = new Coordinator(store);

const apiRouter = api(coord);
app.use('/api', apiRouter);

const uiRouter = ui(app);


const options = {
  key: fs.readFileSync(config.https.key),
  cert: fs.readFileSync(config.https.cert),
};

const server = https.createServer(options, app);
app.server = server;

ws(server, coord);


server.listen(process.env.PORT || 8080);
server.on('listening', () => {
    const bound = server.address();
    console.info(`App running on ${bound.address}:${bound.port}`);
});
