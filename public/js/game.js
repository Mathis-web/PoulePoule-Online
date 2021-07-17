const game = {
    playersDiv: document.querySelector('.players'),
    gameCodeDiv: document.getElementById('game-code-div'),
    hostGameDiv: document.getElementById('host-game-div'),
    startGameBtn: document.getElementById('start-game-btn'),
    tableGame: document.querySelector('.tableGame'),
    isStopBtnAlreadyPressed: false,

    initGameRoom: (info) => {
        const player = document.createElement('div');
        const username = document.createElement('span');
        username.textContent = info.name;
        game.hostGameDiv.textContent = "Hôte de la salle: " + info.name;
        game.gameCodeDiv.textContent = "Code de la salle: " + info.gameRoom.code;
        game.displayHostElements({
            cards: info.gameRoom.gameState.choosenCards,
            difficulty: info.gameRoom.difficulty
        });
        player.className = "player";
        player.appendChild(username);
        game.playersDiv.appendChild(player);
    },

    handleClickMenu(e) {
        const element = e.target;
        // add/remove active class on menu element
        if (e.target.classList.contains('active')) return;
        document.querySelector('.menu-container li.active').classList.remove('active');
        element.classList.add('active');

        // add/remove active class on menu-content element and change its display (flex or none) 
        const menuContent = document.querySelector(`.menu-content[data-menu="${element.getAttribute('data-menu')}"]`);
        document.querySelector('.menu-content.active').style.display="none";
        document.querySelector('.menu-content.active').classList.remove('active');
        menuContent.classList.add('active');
        document.querySelector('.menu-content.active').style.display="flex";
    },

    displayGameInfo: (gameInfo) => {
        game.playersDiv.innerHTML = '';
        game.gameCodeDiv.textContent = "Code de la salle: " + gameInfo.gameCode;
        gameInfo.clients.forEach((player) => {
            if(player.role === 'host') {
                game.hostGameDiv.textContent = "Hôte de la salle: " + player.name;
            }
            const div = document.createElement('div');
            const span = document.createElement('span');
            span.textContent = player.name;
            div.className = "player";
            span.className = "player-name";
            div.appendChild(span);

            if(player.chronometerValue) {
                const span = document.createElement('span');
                span.className = "player-time";
                span.textContent = player.chronometerValue.toFixed(2) + "s";
                div.appendChild(span);
            }
            game.playersDiv.appendChild(div);
        })
    },

    displayHostElements: (gameConfiguration) => {
        game.startGameBtn.style.display = "block";
        document.querySelector('.change-difficulty .select-difficulty').value = gameConfiguration.difficulty;
        document.querySelector('.menu-container').style.display = "block";

        const cards = document.querySelectorAll('.cards-settings input');
        cards.forEach(card => {
            if(gameConfiguration.cards.includes(parseInt(card.value, 10))) {
                card.checked = true;
            }
        })
    },

    hideHostElements: () => {
        game.startGameBtn.style.display = "none";
        document.querySelector('.menu-container').style.display = "none";
    },

    displayTimer(number) {
        game.hideResults();
        const count = document.querySelector('.count');
        count.style.opacity = 0.7;
        if (number === 0) {
            game.endTimer();
            game.tableGame.removeChild(game.tableGame.querySelector('.count-number'));
            return;
        }
        if (game.tableGame.querySelector('.count-number')) {
            game.tableGame.removeChild(game.tableGame.querySelector('.count-number'));
        };
        const div = document.createElement('div');
        div.textContent = number;
        div.className = "count-number";
        game.tableGame.appendChild(div);
    },

    hideResults() {
        game.tableGame.classList.remove('omelette');
        document.querySelector('.results').style.opacity = 0;
    },

    canardIsHere(numberCanardAppearance) {
        const canardContainer = document.querySelector('.tableGame .canard-container');
        canardContainer.appendChild(game.imgCanardScreamer);
        canardContainer.style.opacity = 1;
        const canardSound = document.getElementById('audio-canard');

        const removeCanardContainer = () => {
            canardContainer.style.opacity = 0;
            canardContainer.removeChild(game.imgCanardScreamer);
        }

        canardSound.play();
        canardSound.currentTime = 0;
        if(numberCanardAppearance === 1) {
            setTimeout(() => {
                removeCanardContainer();
            }, 600)
        }
        else if (numberCanardAppearance === 2) {
            setTimeout(() => {
                game.imgCanardScreamer.style.transform = "scaleX(-1)";
                canardSound.play();
                setTimeout(() => {
                    removeCanardContainer();
                }, 300)
            }, 300)
        }

    },

    endTimer() {
        const count = document.querySelector('.count');
        count.style.opacity = 0;
        document.getElementById('stop-btn').style.display = "block";
        game.startChronometer();
    },

    startChronometer() {
        // document.getElementById('waiting-players-span').display = "none";
        game.startChronometerValue = Date.now();
    },

    endChronometer() {
        const duration = (Date.now() - game.startChronometerValue) / 1000;
        return duration;
    },

    stopGame(winner) {
        // game.tableGame.style.opacity = '0.5'
        game.isStopBtnAlreadyPressed = false;
        game.tableGame.removeChild(game.tableGame.querySelector('#card'));
        clearInterval(game.interval);
        const resultsDiv = document.querySelector('.results');
        game.tableGame.classList.add('omelette');
        const winnerDiv = document.querySelector('.winner-message');
        winnerDiv.textContent = 'Vainqueur: ' + winner;
        setTimeout(() => resultsDiv.style.opacity = 1, 2000);
    },

    displayScore(score) {
        const scoreDiv = document.querySelector('.score-message');
        scoreDiv.textContent = `Il y avait ${score} oeufs disponibles lorsque vous avez cliqué sur STOP.`
    }
}