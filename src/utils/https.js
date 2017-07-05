const net = require('net');
const url = require('url');
const https = require('https');
const genServerCA = require('../ssl/server');
const tls = require('tls');
const pki = require('node-forge').pki;
const Lru = require('../utils/lru');

function createServer(handler) {
    return function (req, cltSocket, head) {
        
        const srvUrl = url.parse(`http://${req.url}`);

        createFakeWebSite(srvUrl.hostname, handler, (port) => {
            const srvSocket = net.connect(port, '127.0.0.1', () => {

                cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                                'Proxy-agent: Aobot-Proxy\r\n' +
                                '\r\n');
                srvSocket.write(head);
                srvSocket.pipe(cltSocket);
                cltSocket.pipe(srvSocket);
            });
            srvSocket.on('error', (e) => log.error(`Https internal error`));
        });
    }
}

const lru = new Lru(200);

function createFakeWebSite(host, handler, callback) {
    const cache = lru.get(host);

    if (cache !== null) {
        const states = cache.states;
        if (states.ready) {
            callback(states.port);
        } else {
            states.tasks.push(callback);
        }
    
    } else {

        const states = {
            ready: false,
            port: 0,
            tasks: []  
        };

        states.tasks.push(callback);

        let cert = genServerCA(host);
        const fake = https.createServer({
            key: cert.key,
            cert: cert.cert,
            SNICallback: (host, done) => {
                cert = genServerCA(host);
                done(null, tls.createSecureContext({
                    key: pki.privateKeyToPem(cert.key),
                    cert: pki.certificateToPem(cert.cert)
                }));
            }
        });

        fake.listen(0, () => {
            states.ready = true;
            states.port = fake.address().port;

            states.tasks.forEach((t) => {
                t(states.port);
            });
        });

        fake.on('request', handler);

        fake.on('error', (e) => log.error(`Https internal error`));

        lru.set(host, {
            server: fake,
            states: states
        });
    }
}

module.exports.createServer = createServer;
