const game = {

    start: (gameRoom) => {
        // 0 = chicken, 1 = fox, 2 = egg
        gameRoom.gameState = {
            lotCarte: [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
            listeCartePose: [],
            numberPlayersStoped: 0,
            speed: game.choiceSpeed(gameRoom.difficulty)
        }
        game.generateCardsList(gameRoom.gameState)
    },

    choiceSpeed(difficulty){
        let speed;
        if(difficulty === 'level1'){
            speed = 1300;
        }
        else if(difficulty === 'level2'){
            speed = 1000;
        }
        else if(difficulty === 'level3'){
            speed = 700
        }
        else {
            speed = 1000;
        }
        return speed;
    },

    generateCardsList(gameState) {
        for(let i = 0; i < gameState.lotCarte.length; i++) {
            const randomNumber = game.generateRandomNumber(0, gameState.lotCarte.length);
            gameState.listeCartePose.push(gameState.lotCarte[randomNumber]);
        }
    },

    calculScore(listeCartePose) {
        let score = 0;
        const oeufDispo = [];
        const oeufCouve = [];
        for(let i = 0 ; i < listeCartePose.length; i++){
            if(listeCartePose[i] === 0){
                if(oeufDispo.length > 0 && score > 0){
                    oeufCouve.push('X');
                    score--;
                }
                else if(oeufDispo.length > 0){
                    oeufCouve.push('X');
                }
            }
            else if(listeCartePose[i] === 1){
                if(oeufCouve.length > 0){
                    oeufCouve.splice(0,1);
                    score++;
                }
            }
            else if(listeCartePose[i] === 2){
                oeufDispo.push('X');
                score++
            }
        }
        return score;
    },

    generateRandomNumber: (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
    },

    chooseWinner: (gameRoom) => {
        let winner = {};
        gameRoom.clients.forEach(player => {
            if(player.score === 5) {
                if(!winner.name) {
                    winner = player;
                }
                else {
                    if(player.chronometerValue < winner.chronometerValue) {
                        winner = player;
                    }
                }
            }
        });
        if(!winner.name) winner.name = 'Personne ne gagne cette partie.';
        return winner.name;
    }

}

module.exports = game;