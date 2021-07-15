// contains each game currently active with informations about its state and its players
const gameRooms = {}

const game = require('./game');
const { generateId } = require('./services');

const handleGameRooms = {
    create(hostPlayer, difficulty) {
        const roomCode = generateId(6);
        // put game and user information into gameRoom object
        gameRooms[roomCode] = {
            code: roomCode,
            gameState: {
                // basic configuration of the game
                choosenCards: [0, 1, 2]
            },
            clients: [],
            difficulty: difficulty
        };
        gameRooms[roomCode].clients.push(hostPlayer);

        return gameRooms[roomCode];
    },

    join(roomCode, guestPlayer) {
        const gameRoom = gameRooms[roomCode];
        gameRoom.clients.push(guestPlayer);
    },

    find(roomCode) {
        const gameRoom = gameRooms[roomCode];
        return gameRoom;
    },

    leave(roomCode, leavingPlayerId) {
        let newRoomState = {
            isHostGone: false,
            // newHost: {role:, name:, id:}, that property is added if isHostGone = true
            gameRoom: undefined
        }
        const gameRoom = gameRooms[roomCode];
        if(!gameRoom) return // means that the room no longer exists so leave the function
        const leavingPlayer = gameRoom.clients.find(player => player.id === leavingPlayerId);
        // if the player is the host of the room, give this role to the next player
        if(leavingPlayer.role === 'host') {
            // if another player is present in the room, that player becomes the host
            // otherwise delete the room, because it means that no one is present in the room
            if (gameRoom.clients.length > 1) {
                const newHost = gameRoom.clients[1];
                newHost.role = 'host';
                newRoomState.isHostGone = true;
                newRoomState.newHost = newHost;
            }    
            else {
                delete gameRooms[roomCode];
                return undefined;
            }
        }
        gameRoom.clients.splice(gameRoom.clients.indexOf(leavingPlayer), 1);
        newRoomState.gameRoom = gameRoom;
        return newRoomState;
    },

    startGame(roomCode) {
        const gameRoom = gameRooms[roomCode];
        game.start(gameRoom);
        return gameRoom.gameState;
    },

    stopGame(roomCode, stopInfo, stopedPlayerId) {
        const gameRoom = gameRooms[roomCode];
        let roomInfo = {
            isAllPlayersStoped: false,
            stopedPlayerScore: 0,
            clients: undefined,
            hostId: undefined,
            hostElements: {
                difficulty: gameRoom.difficulty,
                cards: gameRoom.gameState.choosenCards
            },
            winner: undefined
        }

        gameRoom.gameState.numberPlayersStoped++;

        const listeCartePose = gameRoom.gameState.listeCartePose.slice(0, stopInfo.numberOfCardsPlayed);
        const score = game.calculScore(listeCartePose);
        const player = gameRoom.clients.find(player => player.id === stopedPlayerId);
        player.score = score;
        player.chronometerValue = stopInfo.chronometerValue;
        roomInfo.stopedPlayerScore = score;

        // if all players pressed stop button, choose a winner
        if(gameRoom.gameState.numberPlayersStoped === gameRoom.clients.length) {
            const winner = game.chooseWinner(gameRoom);
            roomInfo.isAllPlayersStoped = true;
            roomInfo.winner = winner;
            roomInfo.clients = gameRoom.clients;
            roomInfo.hostId = gameRoom.clients[0].id;
        }

        return roomInfo;
    },

    startTimer(roomCode) {
        // reset players informations
        const gameRoom = gameRooms[roomCode];
        gameRoom.clients.forEach(player => {
           player.chronometerValue = null;
           player.score = 0;
       });

       return gameRoom;
    },

    handleGameConfiguration(roomCode, configuration) {
        const gameRoom = gameRooms[roomCode];
        gameRoom.gameState.choosenCards = configuration.cards;
        gameRoom.difficulty = configuration.difficulty;
    }
};

module.exports = handleGameRooms;