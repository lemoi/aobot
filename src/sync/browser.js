const fs = require('fs');
const path = require('path');
const ioCode = fs.readFileSync(path.join(__dirname, 'socket.io.js'));

module.exports = {
    _port: null,
    _sequne: [],
    code: function (cb) {
        if (this._port === null) {
            this._sequne.push(cb);
        } else {
            cb(`
            <script>
            ${ioCode}
            </script>
            <script>
            var socket = io('ws://127.0.0.1:${this._port}');
            
            socket.on('connect', function () {
                console.log('Connect to the server successfully. ')
            });

            socket.on('refresh', function () {
                location.reload();
            });

            </script>
            `);
        }
    },
    init: function (port) {
        this._port = port;
        this._sequne.forEach((cb) => cb(this._port));
    }
};