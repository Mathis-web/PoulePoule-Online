require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const router = require('./app/router');
const cors = require('cors');
const gameModule = require('./app/game');

app.use(cors());
app.use(express.static('public'));
app.use(router);


const io = require('socket.io')(http, {
    origins: ['https://poulepoule-online.herokuapp.com/']
});

const { generateId } = require('./app/services');

// contains each game currently active with informations about its state and its players
const gameRooms = {}; 


io.on('connection', socket => {

    socket.on('newGame', handleCreateGame);
    socket.on('joinGame', handleJoinGame);
    // socket.on('playerReady', onePlayerReady);
    socket.on('startGame', startGame);
    socket.on('startTimer', startTimer);
    socket.on('disconnect', handleLeaveGame);
    socket.on('stopBtnPressed', handleStopGame);
    socket.on('changeDifficulty', changeDifficulty);

    function handleCreateGame(username, difficulty) {
        const roomCode = generateId(6);
        const player = {
            id: socket.id,
            name: username,
            role: 'host'
        }
        // put game and user information into gameRooms object
        gameRooms[roomCode] = {
            gameState: null,
            clients: [],
            difficulty: difficulty
        };
        socket.username = username;
        socket.gameCode = roomCode;
        gameRooms[roomCode].clients.push(player);
        socket.join(roomCode);  // put the player in the room of the game
        socket.emit('init', {...player, gameCode: roomCode});
    }

    function handleJoinGame(info) {
        const gameRoom = gameRooms[info.gameCode];
        if(!gameRoom) {
           socket.emit('errorJoinGame', 'Cette salle de jeu n\'existe pas.');
           return;
        }
        const player = {
            id: socket.id,
            name: info.username,
            role: 'guest'
        }
        socket.gameCode = info.gameCode;
        socket.username = info.username;
        socket.join(info.gameCode);
        gameRoom.clients.push(player);
        io.sockets.in(info.gameCode).emit('gameInfo', {clients: gameRoom.clients, gameCode: info.gameCode});
    }

    // find the player that leaved the game and remove it in the gameRoom object
    function handleLeaveGame() {
        const gameRoom = gameRooms[socket.gameCode];
        if (socket.gameCode) {
            const player = gameRoom.clients.find(player => player.name === socket.username);
            // if the player is the host of the room, give this role to the next player
            if(player.role === 'host') {
                if (gameRoom.clients[1]) {
                    gameRoom.clients[1].role = 'host';
                    io.to(gameRoom.clients[1].id).emit('host');
                }    
                else {
                    // delete the room if everytone left it
                    delete gameRooms[socket.gameCode];
                }
            }
            gameRoom.clients.splice(gameRoom.clients.indexOf(player), 1);
            // display start game btn to the new host of the room
            io.sockets.in(socket.gameCode).emit('gameInfo', {clients: gameRoom.clients, gameCode: socket.gameCode});
        }
    }

    function startGame() {
        const gameRoom = gameRooms[socket.gameCode];
        gameModule.start(gameRoom);
        const gameState = {
            listeCartePose: gameRoom.gameState.listeCartePose,
            speed: gameRoom.gameState.speed
        };
        io.sockets.in(socket.gameCode).emit('startGame', gameState);
    }

    function handleStopGame(stopInfo) {
        const gameRoom = gameRooms[socket.gameCode];
        gameRoom.gameState.numberPlayersStoped++;
        const numberOfCardsPlayed = stopInfo.numberOfCardsPlayed;
        const listeCartePose = gameRoom.gameState.listeCartePose.slice(0, numberOfCardsPlayed);
        const score = gameModule.calculScore(listeCartePose);
        const player = gameRoom.clients.find(player => player.name === socket.username);
        player.score = score;
        player.chronometerValue = stopInfo.chronometerValue;
        socket.emit('score', score);
        // if all players pressed stop button, choose a winner
        if(gameRoom.gameState.numberPlayersStoped === gameRoom.clients.length) {
            const winner = gameModule.chooseWinner(gameRoom);
            io.sockets.in(socket.gameCode).emit('gameInfo', {
                clients: gameRoom.clients,
                gameCode: socket.gameCode
            });
            io.sockets.in(socket.gameCode).emit('stopGame', winner);
            const host = gameRooms[socket.gameCode].clients[0];
            io.to(host.id).emit('host');
        }
    }

    function startTimer() {
        // reset players informations
        gameRooms[socket.gameCode].clients.forEach(player => {
           player.chronometerValue = null;
           player.score = 0;
       });
       io.sockets.in(socket.gameCode).emit('gameInfo', {clients: gameRooms[socket.gameCode].clients, gameCode: socket.gameCode});
       let timer = 5;
       const timerValue = () => {
           if (timer === 0)  {
               clearInterval(interval);
               socket.emit('endTimer');
           }
           io.sockets.in(socket.gameCode).emit('startTimer', timer);
           timer--;
       }
       timerValue();
       const interval = setInterval(timerValue, 1000);
       
   }

   function changeDifficulty(level) {
        const gameRoom = gameRooms[socket.gameCode];
        gameRoom.difficulty = level;
   }

})

http.listen(PORT, console.log(`Serveur launched on port ${PORT}`))