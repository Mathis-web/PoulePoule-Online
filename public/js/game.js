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
        game.startGameBtn.style.display = "block";
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
                span.textContent = player.chronometerValue + "s";
                div.appendChild(span);
            }
            game.playersDiv.appendChild(div);
        })
    },

    displayStartGameBtn: () => {
        game.startGameBtn.style.display = "block";
    },

    displayNewCard(number) {
        if(game.tableGame.querySelector('#card')) {
            game.tableGame.removeChild(game.tableGame.querySelector('#card'));
        }
        const newImg = document.createElement('img');
        newImg.setAttribute('id', 'card');
        newImg.classList.add('carte_out');
        newImg.src = `/images/${number}.png`;
        game.tableGame.appendChild(newImg);
    },

    startTimer(number) {
        game.tableGame.classList.remove('omelette');
        document.querySelector('.results').style.opacity = 0;
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
        const endChronometerValue = Date.now();
        const duration = (endChronometerValue - game.startChronometerValue) / 1000;
        return duration.toFixed(2);
    },

    stopGame(winner) {
        // game.tableGame.style.opacity = '0.5'
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