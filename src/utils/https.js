const net = require('net');
const url = require('url');
const https = require('https');
const ssl = require('../ssl');
const tls = require('tls');
const pki = require('node-forge').pki;
const parseurl = require('parseurl');

function createServer(handler) {
    return function (req, cltSocket, head) {
        
        const srvUrl = parseurl(req);
        createFakeWebSite(srvUrl.hostname, handler, (port) => {
            const srvSocket = net.connect(port, '127.0.0.1', () => {

                cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                                'Proxy-agent: Aobot-Proxy\r\n' +
                                '\r\n');
                srvSocket.write(head);
                srvSocket.pipe(cltSocket);
                cltSocket.pipe(srvSocket);
            });
            srvSocket.on('error', (e) => {
              console.error(e);
            });
        });
    }
}

function createFakeWebSite(host, handler, callback) {

    let cert = ssl.genServerCA(host);

    const fake = https.createServer({
        key: cert.key,
        cert: cert.cert,
        SNICallback: (host, done) => {
            cert = ssl.genServerCA(host);
            done(null, tls.createSecureContext({
                key: pki.privateKeyToPem(cert.key),
                cert: pki.certificateToPem(cert.cert)
            }));
        }
    });

    fake.listen(0, () => {
        callback(fake.address().port);
    });

    fake.on('request', handler);

    fake.on('error', (e) => {
        console.error(e);
    });
}

module.exports.createServer = createServer;
