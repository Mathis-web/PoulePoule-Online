const main = {
    // socket: io('ws://localhost:3000'),
    socket: io('https://poulepoule-online.herokuapp.com/'),

    init: () => {
        main.usernameInput = document.getElementById('username');
        main.gameCodeInput = document.getElementById('game-code');
        main.difficultySelection = document.getElementById('select-difficulty-homepage');
        main.handleEventListeners();
        main.handleSocketEventListeners();
        main.preloadImages();
    },

    handleSocketEventListeners: () => {
        main.socket.on('init', game.initGameRoom);
        main.socket.on('gameInfo', game.displayGameInfo);
        main.socket.on('newCard', game.displayNewCard);
        main.socket.on('host', game.displayHostElements);
        main.socket.on('startTimer', game.startTimer);
        main.socket.on('startGame', game.displayNewCard);
        main.socket.on('endTimer', main.startGame);
        main.socket.on('stopGame', game.stopGame);
        main.socket.on('score', game.displayScore);
        main.socket.on('disconnect', main.refreshPage);
        main.socket.on('errorJoinGame', (message) => {
            document.getElementById('homepage').style.display = "block";
            document.getElementById('gamepage').style.display = "none";
            alert(message);
        });
    },

    handleEventListeners: () => {
        const createGameBtn = document.getElementById('create-game-btn');
        const joinGameBtn = document.getElementById('join-game-btn');
        const startGameBtn = document.getElementById('start-game-btn');
        const stopBtn = document.getElementById('stop-btn');
        const leaveRoomBtn = document.getElementById('leave-room-btn');
        const changeDifficultyForm = document.getElementById('change-difficulty-form');
        createGameBtn.addEventListener('click', main.createGame);
        joinGameBtn.addEventListener('click', main.joinGame);
        startGameBtn.addEventListener('click', main.startTimer);
        stopBtn.addEventListener('click', main.stopPlayer);
        leaveRoomBtn.addEventListener('click', main.leaveRoom);
        changeDifficultyForm.addEventListener('submit', main.handleChangeDifficulty);
    },

    joinGame: () => {
        if(main.usernameInput.value === "") {
            alert("Choisissez un nom d'utilisateur");
            return;
        }
        const info = {
            username: main.usernameInput.value,
            gameCode: main.gameCodeInput.value
        }
        document.getElementById('homepage').style.display = "none";
        document.getElementById('gamepage').style.display = "flex";
        main.socket.emit('joinGame', info);
    },

    createGame: () => {
        if(main.usernameInput.value === "") {
            alert("Choisissez un nom d'utilisateur");
            return;
        }
        if(main.difficultySelection.value === "") {
            alert('Choisissez une difficulté.');
            return;
        }
        document.getElementById('homepage').style.display = "none";
        document.getElementById('gamepage').style.display = "flex";
        main.socket.emit('newGame', main.usernameInput.value, main.difficultySelection.value);
    },

    startTimer: () => {
        game.hideHostElements();
        main.socket.emit('startTimer');
    },

    startGame() {
        main.socket.emit('startGame');
    },

    stopPlayer: () => {
        document.getElementById('stop-btn').style.display = "none";
        const chronometerValue = game.endChronometer();
        const stopInfo = {
            numberOfCardsPlayed: game.numberOfCardsPlayed,
            chronometerValue: chronometerValue
        };
        main.socket.emit('stopBtnPressed', stopInfo);
    },

    handleChangeDifficulty: (e) => {
        e.preventDefault();
        const level = e.target.elements.difficulty.value;
        if(level === "") {
            alert('Choisissez une difficulté.');
            return;
        }
        main.socket.emit('changeDifficulty', level);
        alert('La difficulé a bien été modifiée.');
    },

    leaveRoom() {
        location.reload();
    },

    preloadImages() {
        const imgPoule = document.createElement('img');
        const imgRenard = document.createElement('img');
        const imgOeuf = document.createElement('img');

        imgPoule.src = "/images/0.png";
        imgRenard.src = "/images/1.png";
        imgOeuf.src = "/images/2.png";

        game.arrayCards = [imgPoule, imgRenard, imgOeuf];
    },

    refreshPage() {
        console.log('recharge la page')
        location.reload();
    }
   
}

main.init();
