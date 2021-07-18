const game = {

    start: (gameRoom) => {
        gameRoom.gameState.lotCarte = game.generateLotCarte(gameRoom.gameState);
        gameRoom.gameState.speed = game.choiceSpeed(gameRoom.difficulty);
        game.generateCardsList(gameRoom);
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

    generateLotCarte(gameState) {
        const choosenCards = gameState.choosenCards;
        // 0 = poule, 1 = renard, 2 = oeuf, 3 = chien, 4 = canard, 5 = renard déguisé
        // 6 = oeuf d'autruche, 7 = ver de terre, 8 = fermier, 9 = coq
        const lotCarte = [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
        if (choosenCards.includes(3)) lotCarte.push(3, 3)
        if (choosenCards.includes(4)) lotCarte.push(4, 4)
        if (choosenCards.includes(5)) {
            lotCarte.push(5, 5);
            lotCarte.splice(lotCarte.indexOf(1), 2)
        }
        if (choosenCards.includes(6)) lotCarte.push(6, 6);
        if (choosenCards.includes(7)) lotCarte.push(7, 7);
        if (choosenCards.includes(8)) lotCarte.push(8, 2, 2, 2, 2);
        if (choosenCards.includes(9)) lotCarte.push(9);

        // randomize the lotCarte array
        for(let i = lotCarte.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i);
            const temp = lotCarte[i];
            lotCarte[i] = lotCarte[j];
            lotCarte[j] = temp;
        }

        return lotCarte;
    },

    generateCardsList(gameRoom) {
        const gameState = gameRoom.gameState;
        const arrayCardsLength = gameState.lotCarte.length;
        for(let i = 0; i < arrayCardsLength; i++) {
            const randomNumber = game.generateRandomNumber(0, gameState.lotCarte.length);
            const cardNumber = gameState.lotCarte[randomNumber];
            gameState.listeCartePose.push(cardNumber);
            gameState.lotCarte.splice(gameState.lotCarte.indexOf(cardNumber), 1);
        }
    },

    // calculScore(listeCartePose) {
    //     let score = 0;
    //     const oeufDispo = [];
    //     const oeufCouve = [];
    //     for(let i = 0 ; i < listeCartePose.length; i++){
    //         if(listeCartePose[i] === 0){
    //             if(oeufDispo.length > 0 && score > 0){
    //                 oeufCouve.push('X');
    //                 score--;
    //             }
    //             else if(oeufDispo.length > 0){
    //                 oeufCouve.push('X');
    //             }
    //         }
    //         else if(listeCartePose[i] === 1){
    //             if(oeufCouve.length > 0){
    //                 oeufCouve.splice(0,1);
    //                 score++;
    //             }
    //         }
    //         else if(listeCartePose[i] === 2){
    //             oeufDispo.push('X');
    //             score++
    //         }
    //     }
    //     return score;
    // },

    calculScore(listeCartePose) {
        const oeufDispo = [];
        const pouleCouve = [];
        const chienPresent = [];
        const oeufAutrucheDispo = [];
        const verDeTerrePresent = [];

        for(let i = 0 ; i < listeCartePose.length; i++){

            if(listeCartePose[i] === 0){ // poule
                if(verDeTerrePresent.length > 0) {
                    verDeTerrePresent.splice(0, 1);
                }
                else if(oeufDispo.length > 0){
                    pouleCouve.push('X');
                    oeufDispo.splice(0, 1);
                }
            }

            else if(listeCartePose[i] === 1){ // renard
                if(pouleCouve.length > 0){
                    if(chienPresent.length > 0) {
                        chienPresent.splice(0, 1);
                    } 
                    else {
                        pouleCouve.splice(0,1);
                        oeufDispo.push('X');
                    }
                }
            }

            else if(listeCartePose[i] === 2){ // oeuf
                oeufDispo.push('X');
            }

            else if (listeCartePose[i] === 3) { // chien
                chienPresent.push('X');
            }

            else if (listeCartePose[i] === 4) { // canard

            }

            else if (listeCartePose[i] === 5) { // renard déguisé
                if(pouleCouve.length > 0){
                    pouleCouve.splice(0,1);
                    oeufDispo.push('X');
                }
            }

            else if (listeCartePose[i] === 6) { // oeuf d'autruche
                oeufAutrucheDispo.push('X');
            }

            else if (listeCartePose[i] === 7) { // ver de terre
                verDeTerrePresent.push('X');
            }

            else if (listeCartePose[i] === 8) { // fermier
                oeufDispo.splice(0, oeufDispo.length);
                oeufAutrucheDispo.splice(0, oeufAutrucheDispo.length);
            }
            // variante avec le coq, toutes les poules qui couvaient vont voir le coq, donc les oeufs deviennent disponibles
            // else if (listeCartePose[i] === 9) {
                // pouleCouve.forEach(oeufCouve => {
                //     oeufDispo.push('X');
                // });
                // pouleCouve.splice(0, pouleCouve.length);
            // }
        }
        return oeufDispo.length + oeufAutrucheDispo.length * 2; 
    },

    generateRandomNumber: (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
    },

    chooseWinner: (gameRoom) => {
        let winner = {};

        gameRoom.clients.forEach(player => {
            if(player.oeufDispo === 5) {
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

        // if no one wins and someone stoped his cards list with the coq
        // we check the value they gave
        if(!winner.name && gameRoom.isCoqHere) {
    
            gameRoom.clients.forEach(player => {
                if(player.isCoqHere && parseInt(player.coqEggsNumber, 10) === gameRoom.oeufDispoAfterCoq) {
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

            if(!winner.name) {
                winner = {
                    name: `Personne ne gagne cette partie. ${gameRoom.oeufDispoAfterCoq} oeufs étaient disponibles après le passage de Rico le coq.`,
                    oeufDispoAfterCoq: gameRoom.oeufDispoAfterCoq
                }
            }
        }


        if(!winner.name) winner.name = 'Personne ne gagne cette partie.';

        return winner;
    }

}

module.exports = game;