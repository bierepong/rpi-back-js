'use strict'


const request = require('request-promise-native');

const fs = require('fs');

function sanitize(line) {
    return line.replace(/\s/g, '%20').replace(/=/g, '%3D').replace(/,/g, '%2C').replace(/}/g,'%7D'); 
}

class Game {

    constructor(opts) {
        this.playing = false;
        this.games = 0;
        this.opts = opts || {};
        this.WARP10_TOKEN = process.env.WARP10_TOKEN || this.opts.WARP10_TOKEN;
    }


    beginGame(username, email, balls, driver) {

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

        this.driver = driver;
        this.driver.setCallback((result) => {
            const newStatus = result.map((elt) => {
                return elt <= 12;
            });

            if (newStatus.reduce((total, elt, index) => {
                return total || elt !== this.currentGame.status[index];
            }, false)) {
                this.receivedStatus(newStatus, this.opts.mock);
            }

            this.currentGame.status = newStatus;
        });
    }

    endGame() {
        if (!this.playing) {
            console.log('[Game] endGame - Not playing right now');
            return;
        }
        this.driver.setCallback(null);
        this.playing = false;
        console.log('[Game] endGame');
    }

    isGameEnded() {
        if (
            this.currentGame.distances.filter( (item) => {
                return item;
            }).length == 0 
        ) {
            this.endGame();
        }
    }

    receivedStatus(status, dry) {
        let timestamp = new Date().getTime()*1000;
        let datapoints = '';

        status.forEach((val, index) => {
            const value = val ? 1 : 0;
                datapoints += `${timestamp}// beerpong.sensor.status{sensorID=${index},player=${sanitize(this.currentGame.username)},email=${sanitize(this.currentGame.email)},balls=${this.currentGame.balls},gameId=${this.currentGame.uuid}} ${value}\n`;
        });
        console.log(datapoints);
        if (!dry && this.opts.enableWarp10) {
            let options = {
                method: 'POST',
                uri: this.opts.WARP10_URL,
                headers: {
                    'X-Warp10-Token': this.opts.WARP10_TOKEN,
                },
                body: datapoints,
                resolveWithFullResponse: true 
            };
            request(options)
            .then(function (response) {
                console.log(`${response.statusCode} - ${response.statusMessage}`)
            })
            .catch(function (response) {
                console.log(`${response.statusCode} - ${response}`)
            });
        } 
    }

}

module.exports = Game;