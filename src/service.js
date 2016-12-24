const express = require('express');
const api = require('./api');

const app = express();

app.use('/', express.static('public'));
app.use('/api', api);

const server = app.listen(8080);

server.on('listening', () => {
    const bound = server.address();
    console.info(`App running on ${bound.address}:${bound.port}`);
});
