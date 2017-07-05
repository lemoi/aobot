const net = require('net');
const url = require('url');
const log = require('./log');

 module.exports = function (req, cltSocket, head) {

    const srvUrl = url.parse(`http://${req.url}`);

    const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {

        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: Aobot-Proxy\r\n' +
                        '\r\n');
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
    });

    srvSocket.on('error', (e) => {
        log.error(`Https transmiting failed(${srvUrl.hostname}:${srvUrl.port})`);
        cltSocket.end();
    });

    cltSocket.on('close', () => srvSocket.end());
 }
