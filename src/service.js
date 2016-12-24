const express = require('express');

const Storage = require('./Storage');
const api = require('./api');


const app = express();
app.use('/', express.static('public'));

const store = new Storage();
store.dir = '/tmp';
const router = api(store);

app.use('/api', router);


const server = app.listen(8080);

server.on('listening', () => {
    const bound = server.address();
    console.info(`App running on ${bound.address}:${bound.port}`);
});
