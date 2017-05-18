const net = require('net');

module.exports = function (req, socket, head) {
    try {
        
        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443
        };

        connectRemote(requestOptions, socket);

        function ontargeterror(e) {
            console.log(req.url + " Tunnel error: " + e);
            _synReply(socket, 502, "Tunnel Error", {}, function() {
                try {
                    socket.end();
                }
                catch(e) {
                    console.log('end error' + e.message);
                }

            });
        }

        function connectRemote(requestOptions, socket) {
            var tunnel = net.createConnection(requestOptions, function() {
                //format http protocol
                _synReply(socket, 200, 'Connection established', {
                        'Connection': 'keep-alive',
                        'Proxy-Agent': 'Easy Proxy 1.0'
                    },
                    function(error) {
                        if (error) {
                            console.log("syn error", error.message);
                            tunnel.end();
                            socket.end();
                            return;
                        }
                        tunnel.pipe(socket);
                        socket.pipe(tunnel);
                    }
                );
            });

            tunnel.setNoDelay(true);

            tunnel.on('error', ontargeterror);
        }
    } catch (e) {
        console.log("connectHandler error: " + e.message);
    }

}

function _synReply(socket, code, reason, headers, cb) {
    try {
        var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
        var headerLines = '';
        for (var key in headers) {
            headerLines += key + ': ' + headers[key] + '\r\n';
        }
        socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
    } catch (error) {
        cb(error);
    }
}