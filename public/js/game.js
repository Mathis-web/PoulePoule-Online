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
        const removeCanardContainer = () => {
            canardContainer.style.opacity = 0;
            imgCanardScreamer.style.transform = "scaleX(1)";
            imgCanardScreamer.style.height = "60%";
        }
        const canardContainer = document.querySelector('.tableGame .canard-container');
        const imgCanardScreamer = document.querySelector('.canard-container img');
        canardContainer.style.opacity = 1;

        const playCanard = () => {
            game.canardSound.play();
            game.canardSound.currentTime = 0;
        }

        playCanard();
        if(numberCanardAppearance === 1) {
            setTimeout(() => {
                removeCanardContainer();
            }, 600)
        }
        else if (numberCanardAppearance === 2) {
            setTimeout(() => {
                imgCanardScreamer.style.height = "80%";
                imgCanardScreamer.style.transform = "scaleX(-1)";
                playCanard();
                setTimeout(() => {
                    removeCanardContainer();
                }, 300)
            }, 300)
        }

    },

    displayCoqForm() {
        game.tableGame.style.display = "none";
        document.getElementById('stop-btn').style.display = "none";
        const coqContainer = document.querySelector(' .coq-container');
        coqContainer.style.display = 'flex';
        const counter = document.querySelector('.coq-container .counter');
        let number = 9;
        game.coqFormInterval = setInterval(() => {
            if(number === 0) {
                clearInterval(game.coqFormInterval);
                document.querySelector('.coq-container form').requestSubmit();
                counter.textContent = '';
                return
            }
            counter.textContent = number;
            number--;
        }, 1000);
    },

    stopCoqFormInterval() {
        const coqContainer = document.querySelector('.coq-container');
        coqContainer.style.display = "none";
        game.tableGame.style.display = "flex"
        clearInterval(game.coqFormInterval);
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

    stopGame(isWinnerWithCoq, winner) {
        // game.tableGame.style.opacity = '0.5'
        game.isStopBtnAlreadyPressed = false;
        if(game.tableGame.querySelector('#card')) {
            game.tableGame.removeChild(game.tableGame.querySelector('#card'));
        }
        clearInterval(game.interval);
        const resultsDiv = document.querySelector('.results');
        game.tableGame.classList.add('omelette');
        const winnerDiv = document.querySelector('.winner-message');
        if(isWinnerWithCoq) {
            winnerDiv.textContent = `Vainqueur: ${winner.name} ! ${winner.oeufDispoAfterCoq} oeufs étaient disponibles après le passage de Rico le coq.`;
        }
        else {
            winnerDiv.textContent = 'Vainqueur: ' + winner.name;
        }
        setTimeout(() => resultsDiv.style.opacity = 1, 2000);
    },

    displayScore(isStopedBecauseOfCoq, oeufsDispo) {
        const scoreDiv = document.querySelector('.score-message');
        if(isStopedBecauseOfCoq) {
            scoreDiv.textContent = oeufsDispo != '' ? `Selon vous, ${oeufsDispo} oeufs étaient disponibles lorsque le coq est arrivé.` : 'Vous n\'avez pas donné de chiffre lorsque le coq est arrivé.';
        } else {
            scoreDiv.textContent = `Selon vous, ${oeufsDispo} oeufs étaient disponibles.`
        }
    }
}