const main = {
    socket: io('ws://localhost:3000'),
    // socket: io('https://poulepoule-online.herokuapp.com/'),

    init: () => {
        main.usernameInput = document.getElementById('username');
        main.gameCodeInput = document.getElementById('game-code');
        main.difficultySelection = document.getElementById('select-difficulty-homepage');
        main.handleEventListeners();
        main.handleSocketEventListeners();
        main.preloadImages();
        main.addCardsSettingsInDOM();
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
        main.socket.on('disconnect', main.leaveRoom);
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
        const menuElements = document.querySelectorAll('.menu-container ul li').forEach(element => {
            element.addEventListener('click', game.handleClickMenu)
        });
        const gameSettingsForm = document.querySelector('.game-configuration');

        createGameBtn.addEventListener('click', main.createGame);
        joinGameBtn.addEventListener('click', main.joinGame);
        startGameBtn.addEventListener('click', main.startTimer);
        stopBtn.addEventListener('click', main.stopPlayer);
        leaveRoomBtn.addEventListener('click', main.leaveRoom);
        gameSettingsForm.addEventListener('submit', main.changeGameConfiguration)
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

    leaveRoom() {
        alert("Une erreur s'est produite, vous allez être redirigé vers la page d'accueil.");
        location.reload();
    },

    changeGameConfiguration(e) {
        e.preventDefault();
        let gameConfiguration = {
            cards: [],
            difficulty: e.target.elements.difficulty.value
        }
        e.target.elements.cards.forEach((card, index) => {
            if (card.checked) gameConfiguration.cards.push(index)
        });
        console.log(gameConfiguration)
        main.socket.emit('changeGameConfiguration', gameConfiguration)
    },

    preloadImages() {
        const imgPoule = document.createElement('img');
        const imgRenard = document.createElement('img');
        const imgOeuf = document.createElement('img');
        const imgChien = document.createElement('img');
        const imgCanard = document.createElement('img');
        const imgRenardDeguise = document.createElement('img');
        const imgOeufAutruche = document.createElement('img');
        const imgVerDeTerre = document.createElement('img');
        const imgFermier = document.createElement('img');
        const imgCoq = document.createElement('img');

        imgPoule.src = "/images/0.png";
        imgRenard.src = "/images/1.png";
        imgOeuf.src = "/images/2.png";
        imgChien.src = "/images/3.png";
        imgCanard.src = "/images/4.png";
        imgRenardDeguise.src = "/images/5.png";
        imgOeufAutruche.src = "/images/6.png";
        imgVerDeTerre.src = "/images/7.png";
        imgFermier.src = "/images/8.png";
        imgCoq.src = "/images/9.png";

        game.arrayCards = [imgPoule, imgRenard, imgOeuf, imgChien, imgCanard, imgRenardDeguise, imgOeufAutruche, imgVerDeTerre, imgFermier, imgCoq];
    },

    addCardsSettingsInDOM() {
        const cardsSettingsContainer = document.querySelector('.cards-settings');
        game.arrayCards.forEach((card, index) => {
            const cardInput = `
                <input type="checkbox" id="${index}" ${index === 0 || index === 1 || index === 2 ? 'checked disabled' : "" } name="cards" value="${index}">
                <label for="${index}">
                    <img src="${card.src}">
                </label>
            `;
            cardsSettingsContainer.innerHTML += cardInput;
        })
    },

}

main.init();
