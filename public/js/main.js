const main = {
    socket: io('ws://localhost:3000'),
    // socket: io('https://poulepoule-online.herokuapp.com/'),

    init: () => {
        main.usernameInput = document.getElementById('username');
        main.gameCodeInput = document.getElementById('game-code');
        main.difficultySelection = document.getElementById('select-difficulty-homepage');
        main.handleEventListeners();
        main.handleSocketEventListeners();
        main.preloadMedias();
        main.addCardsSettingsInDOM();
    },

    handleSocketEventListeners: () => {
        main.socket.on('init', game.initGameRoom);
        main.socket.on('gameInfo', game.displayGameInfo);
        main.socket.on('host', game.displayHostElements);
        main.socket.on('displayTimer', game.displayTimer);
        main.socket.on('startGame', main.displayNewCard);
        main.socket.on('stopGame', game.stopGame);
        main.socket.on('score', game.displayScore);
        main.socket.on('disconnect', main.disconnectError);
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
        const coqForm = document.querySelector('.coq-container form');

        createGameBtn.addEventListener('click', main.createGame);
        joinGameBtn.addEventListener('click', main.joinGame);
        startGameBtn.addEventListener('click', main.startGame);
        stopBtn.addEventListener('click', main.stopPlayer);
        leaveRoomBtn.addEventListener('click', main.leaveRoom);
        gameSettingsForm.addEventListener('change', main.changeGameConfiguration);
        coqForm.addEventListener('submit', main.submitCoqForm)
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

    startGame: () => {
        game.hideHostElements();
        main.socket.emit('startTimer');
    },

    displayNewCard(gameState) {
        game.numberOfCardsPlayed = 0;
        let numberCanardAppearance = 0;
        if(gameState.speed < 800) {
            document.documentElement.style.setProperty('--animation-duration', '700ms');
        }

        game.interval = setInterval(() => {
            if(gameState.listeCartePose.length === game.numberOfCardsPlayed) {
                clearInterval(game.interval);
                main.stopPlayer();
                return;
            }
            if(game.tableGame.querySelector('#card')) {
                game.tableGame.removeChild(game.tableGame.querySelector('#card'));
            }
            // get the number of the card to display from the list in the gameState object
            const cardNumber = gameState.listeCartePose[game.numberOfCardsPlayed]
            if(cardNumber === 4) {
                numberCanardAppearance++;
                game.canardIsHere(numberCanardAppearance);
            };
            // and get that card with the corresponding index in arrayCard
            // ex: cardNumber = 0, so arrayCards[0] corresponds to the chicken card 
            const newImg = game.arrayCards[cardNumber];
            newImg.id = 'card';
            newImg.classList.add('carte_out');
            game.tableGame.appendChild(newImg);
            if(cardNumber === 9) {
                if (!game.isStopBtnAlreadyPressed) {
                    setTimeout(() => {
                        game.displayCoqForm();
                        game.tableGame.removeChild(game.tableGame.querySelector('#card'));
                    }, 1100)
                }
                clearInterval(game.interval);
                return;
            };
            game.numberOfCardsPlayed++;
        }, gameState.speed);
    },

    submitCoqForm(e) {
        e.preventDefault();
        const counter = document.querySelector('.coq-container .counter');
        const stopInfo = {
            isCoqHere: true,
            numberOfEggs: e.target.elements.numberEggs.value,
            numberOfCardsPlayed: game.numberOfCardsPlayed,
            chronometerValue: game.endChronometer()
        }
        e.target.elements.numberEggs.value = '';
        counter.textContent = '';
        game.stopCoqFormInterval();
        main.socket.emit('coqEggsNumber', stopInfo);
    },

    stopPlayer: () => {
        // this function could be executed twice, when you click on stopBtn or when all cards have been played
        // we have to have to make sure we only execute it once per player
        if(game.isStopBtnAlreadyPressed) return;
        game.isStopBtnAlreadyPressed = true;
        document.getElementById('stop-btn').style.display = "none";
        const chronometerValue = game.endChronometer();
        const stopInfo = {
            numberOfCardsPlayed: game.numberOfCardsPlayed,
            chronometerValue: chronometerValue
        };
        main.socket.emit('stopBtnPressed', stopInfo);
    },

    disconnectError() {
        alert("Une erreur s'est produite, vous allez être redirigé vers la page d'accueil.");
        location.reload();
    },

    leaveRoom() {
        const isLeaving = confirm('Etes-vous sûr de vouloir quitter la salle ?')
        if(isLeaving) location.reload();
    },

    changeGameConfiguration() {
        const cards = document.querySelectorAll('.cards-settings input:checked')
        const difficulty = document.querySelector('.change-difficulty .select-difficulty');
        let gameConfiguration = {
            cards: [],
            difficulty: difficulty.value
        }
        cards.forEach((card) => {
            if (card.checked) gameConfiguration.cards.push(parseInt(card.value, 10))
        });
        main.socket.emit('changeGameConfiguration', gameConfiguration)
    },

    preloadMedias() {
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

        const canardSound = document.getElementById('audio-canard');
        canardSound.addEventListener('canplaythrough', event => {
            game.canardSound = canardSound;
        })

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
