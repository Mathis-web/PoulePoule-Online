require('dotenv').config();
const express = require('express');
const app = express();
const expressSession = require('express-session');
const server = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const router = require('./app/router');
const cors = require('cors');
const io = require('socket.io')(server);

const sessionMiddleware = expressSession({
    secret: 'random secret',
    saveUninitialized: true,
    resave: true
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

require('./app/sockets').listen(io);

app.use(sessionMiddleware);
app.use(cors());
app.use(express.static('public'));
app.use(router);

server.listen(PORT, console.log(`Serveur launched on port ${PORT}`));