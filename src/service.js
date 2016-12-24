const http = require('http');
const express = require('express');

const Coordinator = require('./Coordinator');
const Storage = require('./Storage');
const api = require('./api');
const ui = require('./ui');
const ws = require('./ws');



const app = express();
app.use('/', express.static('public'));

const store = new Storage();
store.dir = process.env.STORAGE_DIR || '/tmp';

const coord = new Coordinator(store);

const apiRouter = api(coord);
app.use('/api', apiRouter);

const uiRouter = ui(app);


const server = http.createServer(app);
app.server = server;

ws(server, coord);


server.listen(process.env.PORT || 8080);
server.on('listening', () => {
    const bound = server.address();
    console.info(`App running on ${bound.address}:${bound.port}`);
});
