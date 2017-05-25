const fs = require('fs');
const path = require('path');
const ioCode = fs.readFileSync(path.join(__dirname, 'socket.io.js'));

module.exports = function (port) {
    return `
    <script>
    ${ioCode}
    </script>
    <script>
    var socket = io('ws://127.0.0.1:${port}');
    
    socket.on('connect', function () {
        console.log('Connect to the server successfully. ')
    });

    socket.on('refresh', function () {
        location.reload();
    });

    </script>
    `;   
}
;