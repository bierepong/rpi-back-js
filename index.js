const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');
const opts = require('../config.json');

const Game = require('./game');
const Driver = require('./driver');
const game = new Game(opts);
const driver = new Driver({
    usbPort: opts.usbPort,
    baudRate: opts.baudRate,
    // defaults for Arduino serial communication
    dataBits: 8, 
    parity: 'none', 
    stopBits: 1, 
    flowControl: false,
    mock: opts.mock
})


app.use(cors());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.post('/begin', (req, res) => { 
    console.log('[index] /begin', req.body);
    game.beginGame(req.body.username, req.body.email, req.body.balls, driver);
    res.json({
        status: 'begin'
    });
});

app.post('/end', (req, res) => { 
    game.endGame();
    res.json({
        status: 'end',
        result: game.currentGame? game.currentGame.status : []
    });
});


app.get('/status', (req, res) => {
    console.log('[status]', game.currentGame);
    res.json(game.currentGame || { error: 'No game' });
})

app.use('/', express.static(opts.public_html))

app.listen(3000, () => console.log('Example app listening on port 3000!'))