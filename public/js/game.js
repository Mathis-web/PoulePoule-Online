const game = {
    playersDiv: document.querySelector('.players'),
    gameCodeDiv: document.getElementById('game-code-div'),
    hostGameDiv: document.getElementById('host-game-div'),
    startGameBtn: document.getElementById('start-game-btn'),
    tableGame: document.querySelector('.tableGame'),

    initGameRoom: (info) => {
        const player = document.createElement('div');
        const username = document.createElement('span');
        username.textContent = info.name;
        game.hostGameDiv.textContent = "Hôte de la salle: " + info.name;
        game.gameCodeDiv.textContent = "Code de la salle: " + info.gameCode;
        game.displayHostElements();
        player.className = "player";
        player.appendChild(username);
        game.playersDiv.appendChild(player);
    },

    displayPlayers: (gameInfo) => {
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

    displayHostElements: () => {
        game.startGameBtn.style.display = "block";
        document.querySelector('.change-difficulty').style.display = "block";
    },

    hideHostElements: () => {
        game.startGameBtn.style.display = "none";
        document.querySelector('.change-difficulty').style.display = "none";
    },

    displayNewCard(gameState) {
        game.numberOfCardsPlayed = 0;
        game.interval = setInterval(() => {
            if(gameState.listeCartePose.length === game.numberOfCardsPlayed) {
                clearInterval(interval);
            }
            if(game.tableGame.querySelector('#card')) {
                game.tableGame.removeChild(game.tableGame.querySelector('#card'));
            }
            // get the number of the card to display from the list in the gameState object
            const cardNumber = gameState.listeCartePose[game.numberOfCardsPlayed]
            // and get that card with the corresponding index in arrayCard
            // ex: cardNumber = 0, so arrayCards[0] corresponds to the chicken card 
            const newImg = game.arrayCards[cardNumber];
            newImg.id = 'card';
            newImg.classList.add('carte_out');
            game.tableGame.appendChild(newImg);
            game.numberOfCardsPlayed++;
        }, gameState.speed);
    },

    startTimer(number) {
        game.hideResults();
        const count = document.querySelector('.count');
        count.style.opacity = 0.7;
        if (number === 0) {
            game.endTimer();
            return;
        }
        game.tableGame.removeChild(game.tableGame.querySelector('.count-number'));
        const div = document.createElement('div');
        div.textContent = number;
        div.className = "count-number";
        game.tableGame.appendChild(div);
    },

    hideResults() {
        game.tableGame.classList.remove('omelette');
        document.querySelector('.results').style.opacity = 0;
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