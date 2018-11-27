const fs = require('fs');

class Game {

    constructor(opts) {
        this.playing = false;
        this.games = 0;
        this.opts = opts || {};
        this.WARP10_TOKEN = process.env.WARP10_TOKEN || this.opts.WARP10_TOKEN;
    }


    beginGame(username, email, balls) {

        if (this.playing) {
            console.log('[Game] beginGame - Already playing');
            return;
        }

        console.log('[Game] beginGame');
        this.playing = true;
        this.games++;

        this.currentGame = {
            username: username || 'unknown',
            email: email || 'unknown',
            balls: balls || 6,
            uuid: `${new Date().getTime()}000`,
            status: Array.apply(null, { length: balls || 6 }).map(() => false),
        }
    }

    endGame() {
        if (!this.playing) {
            console.log('[Game] endGame - Not playing right now');
            return;
        }
        this.playing = false;
        console.log('[Game] endGame');
    }


}

module.exports = Game;