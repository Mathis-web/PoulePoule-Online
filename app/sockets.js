const handleGameRooms = require('./gameRooms');

module.exports.listen = function(server) {
    // receives the server as a function parameter and launch it
    const io = require('socket.io')(server);

    io.on('connection', socket => {

        socket.on('newGame', createRoom);
        socket.on('joinGame', joinRoom);
        // socket.on('playerReady', onePlayerReady);
        socket.on('startGame', startGame);
        socket.on('startTimer', startTimer);
        socket.on('disconnect', leaveRoom);
        socket.on('stopBtnPressed', handleStopGame);
        socket.on('changeDifficulty', changeDifficulty);
    
        function createRoom(username, difficulty) {
            const hostPlayer = {
                id: socket.id,
                name: username,
                role: 'host'
            }
            const gameRoom = handleGameRooms.create(hostPlayer, difficulty);
            socket.username = username;
            socket.gameCode = gameRoom.code;
            socket.join(gameRoom.code);  // put the player in the room
            socket.emit('init', {...hostPlayer, gameCode: gameRoom.code});
        }
    
        function joinRoom(info) {
            const gameRoom = handleGameRooms.find(info.gameCode);
            if(!gameRoom) {
               socket.emit('errorJoinGame', 'Cette salle de jeu n\'existe pas.');
               return;
            };
            const guestPlayer = {
                id: socket.id,
                name: info.username,
                role: 'guest'
            };
            handleGameRooms.join(info.gameCode, guestPlayer);
            socket.gameCode = gameRoom.code;
            socket.username = gameRoom.code;
            socket.join(gameRoom.code);
            io.sockets.in(gameRoom.code).emit('gameInfo', {clients: gameRoom.clients, gameCode: gameRoom.code});
        }
    
        function leaveRoom() {
            const newRoomState = handleGameRooms.leave(socket.gameCode, socket.id);
            
            if(newRoomState) {
                io.sockets.in(socket.gameCode).emit('gameInfo', {clients: newRoomState.gameRoom.clients, gameCode: socket.gameCode});
            }
    
            if (newRoomState && newRoomState.isHostGone) {
                io.to(newRoomState.newHost.id).emit('host');
            }
        }
    
        function startGame() {
            const gameState = handleGameRooms.startGame(socket.gameCode);
            io.sockets.in(socket.gameCode).emit('startGame', gameState);
        }
    
        function handleStopGame(stopInfo) {
            const roomInfo = handleGameRooms.stopGame(socket.gameCode, stopInfo, socket.id);
            socket.emit('score', roomInfo.stopedPlayerScore)
    
            if(roomInfo.isAllPlayersStoped) {
                io.sockets.in(socket.gameCode).emit('gameInfo', {
                    clients: roomInfo.clients,
                    gameCode: socket.gameCode
                });
                io.sockets.in(socket.gameCode).emit('stopGame', roomInfo.winner);
                io.to(roomInfo.hostId).emit('host');
            }
        }
    
        function startTimer() {
           const gameRoom = handleGameRooms.startTimer(socket.gameCode)
           io.sockets.in(socket.gameCode).emit('gameInfo', {clients: gameRoom.clients, gameCode: socket.gameCode});
    
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
            handleGameRooms.changeDifficulty(socket.gameCode, level)
       }
    
    })
};