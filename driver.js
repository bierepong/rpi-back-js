'use strict'

const SerialPort = require('serialport');

class Driver {

    constructor(opts) {

        this.opts = opts || {};

        this.result = [];
        this.receivedData = '';
        
        if (!opts.mock) {
            let serialFile;
            opts.usbPort.forEach(element => {
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
        const structData = splitedData.filter((element) => {
            return element.length>4;
        }).map((element) => {
            try {
                return JSON.parse(element);
            } catch(e) {
                return [];
            }
        });

        if (structData.length) {
            this.result = structData[0];
            this.receivedData = '';
            if (this.opts.callback) {
                this.opts.callback(this.result);
            }
        }
    }

    mock() {
        const mocks = [
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 45]\n",
            "[15, 25, 55, 85, 95, 4]\n",
            "[15, 25, 55, 85, 95, 4]\n",
            "[15, 25, 55, 85, 9, 4]\n",
            "[15, 25, 5, 85, 9, 4]\n",
            "[15, 2, 5, 85, 9, 4]\n"
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