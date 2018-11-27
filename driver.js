'use strict'

const SerialPort = require('serialport');

class Driver {

    constructor(opts) {

        this.opts = opts || {};
        this.opts.callbacks = this.opts.callbacks || {};

        this.result = [];
        this.receivedData = '';
        
        if (!opts.mock) {
            let serialFile;
            opts.usbPort.forEach(() => {
                if (fs.existsSync('/dev/ttyACM0')) {
                    serialFile = '/dev/ttyACM0';
                }
            });

            if (!serialFile) {
                console.log('No Arduino found');
                return;
            }
    
            let port = new SerialPort(serialFile, {
                baudRate: opts.baudRate,
                dataBits: opts.dataBits, 
                parity: opts.parity, 
                stopBits: opts.stopBits, 
                flowControl: opts.flowControl 
            }, (error) => {
                if (error) {  
                    console.log('opening serial error', error);
                    process.exit(1);
                }
            });

            port.on("open", () => {
                console.log('open serial communication');
                // Listens to incoming data
                port.on('data', (data) => {
                    this.parseData(data);
                });  
            });
        } else {
            this.mock();
        }
    }

    parseData(data) {
        this.receivedData += data.toString();

        const splitedData = this.receivedData.split(/\n/).reverse();
        const rpc = splitedData
        .filter((element) => {
            return /;$/.test(element);
        });
        if (rpc.length) {
            try {
                return eval(`this.opts.callbacks.${rpc[0]}`);
            } catch(e) {
                console.log(`Could not eval ${rpc[0]}`, e);
            }
        }
    }

    mock() {
        const mocks = [
            "sensor(15, 25, 55, ",
            "85, 95, 45);\n",
            "sensor(15, 25, 55, 85, 95, 45);\n",
            "sensor(15, 25, 55, 85, 95, 45",
            ");\n",
            "sensor(15, 25, 55, 85, 95, 45);\n",
            "senso",
            "r(15, 25, 55, 85, 95, 45);\n",
            "sensor(15, 25, 55, 85, 95, 45);\n",
            "sensor(1",
            "5, 25, 55, 85, 95, 4);\n",
            "sensor(15, 25, 55, 85, 95, 4);\n",
            "sensor(15, 25, 55, 85, 9, 4);\n",
            "sensor(15, 25, 5, 85, 9, 4);\n",
            "sensor(15, 2, 5, 85, 9, 4);\n"
        ]
        let i = 0;
        var interval = setInterval(() => {
            this.parseData(mocks[i++ % mocks.length]);
        }, 1000);
    }


    setCallback(callback) {
        this.opts.callback = callback;
    }

    close() {
        this.port.close( () => {
            process.exit(0);
        });
    }

}

module.exports = Driver