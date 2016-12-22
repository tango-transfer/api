const express = require('express');
const api = require('./api');

const app = express();

app.use('/api', api);

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

const server = app.listen(PORT);
server.on('listening', () => {
    const bound = server.address();
    console.info(`App running on ${bound.address}:${bound.port}`);
});
