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
            isGameActive: false,
            isCoqHere: false,
            oeufDispoAfterCoq: undefined,
            gameState: {
                // basic configuration of the game
                choosenCards: [0, 1, 2],
                lotCarte: [],
                listeCartePose: [],
                numberPlayersStoped: 0,
                speed: undefined
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
        gameRoom.isGameActive = true;
        handleGameRooms.resetGameInformations(gameRoom);
        game.start(gameRoom);
        return gameRoom.gameState;
    },

    stopGame(roomCode, stopInfo, stopedPlayerId) {
        const gameRoom = gameRooms[roomCode];

        let roomInfo = {
            isAllPlayersStoped: false,
            stopedPlayerScore: 0,
            isStopedPlayerBecauseOfCoq: false,
            clients: undefined,
            hostId: undefined,
            hostElements: {
                difficulty: gameRoom.difficulty,
                cards: gameRoom.gameState.choosenCards
            },
            winner: undefined,
            isCoqHere: false
        }
        gameRoom.gameState.numberPlayersStoped++;

        const listeCartePose = gameRoom.gameState.listeCartePose.slice(0, stopInfo.numberOfCardsPlayed);
        const score = game.calculScore(listeCartePose);
        const player = gameRoom.clients.find(player => player.id === stopedPlayerId);
        player.oeufDispo = score;
        player.chronometerValue = stopInfo.chronometerValue;
        roomInfo.stopedPlayerScore = score;

        // means that player stoped his game with the coq, so first we check if someone pressed stop and won before the coq appeared
        // if not, we check the value of the player who stoped their cards list with the coq
        if(stopInfo.isCoqHere) {
            player.isCoqHere = true;
            player.oeufDispo = undefined;
            player.coqEggsNumber = stopInfo.numberOfEggs,
            roomInfo.stopedPlayerScore = stopInfo.numberOfEggs;
            roomInfo.isStopedPlayerBecauseOfCoq = true;
            player.oeufDispoAfterCoq = score;
            gameRoom.isCoqHere = true;
            gameRoom.oeufDispoAfterCoq = score;
        }

        // if all players pressed stop button, choose a winner
        if(gameRoom.gameState.numberPlayersStoped === gameRoom.clients.length) {
            const winner = game.chooseWinner(gameRoom);
            // if winner wins thanks to the coq
            if(winner.isCoqHere) {
                roomInfo.isCoqHere = true
            }
            roomInfo.isAllPlayersStoped = true;
            roomInfo.winner = winner;
            roomInfo.clients = gameRoom.clients;
            roomInfo.hostId = gameRoom.clients[0].id;
            gameRoom.isGameActive = false;
        }

        return roomInfo;
    },

    startTimer(roomCode) {
        // reset players informations
        const gameRoom = gameRooms[roomCode];
        gameRoom.isGameActive = true;
        handleGameRooms.resetPlayersInformations(gameRoom.clients);

       return gameRoom;
    },

    resetPlayersInformations(players) {
        players.forEach(player => {
            player.chronometerValue = null;
            player.oeufDispo = undefined;
            player.isCoqHere = false;
            player.coqEggsNumber = undefined;
            player.oeufDispoAfterCoq = undefined;
        });
    },

    resetGameInformations(gameRoom) {
        gameRoom.isCoqHere = false;
        gameRoom.oeufDispoAfterCoq = undefined;
        gameRoom.gameState.numberPlayersStoped = 0;
        gameRoom.gameState.listeCartePose = [];
    },

    handleGameConfiguration(roomCode, configuration) {
        const gameRoom = gameRooms[roomCode];
        gameRoom.gameState.choosenCards = configuration.cards;
        gameRoom.difficulty = configuration.difficulty;
    },

};

module.exports = handleGameRooms;