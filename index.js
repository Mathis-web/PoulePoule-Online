require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const router = require('./app/router');
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(router);

require('./app/sockets').listen(server);

server.listen(PORT, console.log(`Serveur launched on port ${PORT}`));