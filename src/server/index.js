const express = require('express');
const http = require('http');
const https = require('../utils/https');
const transmit = require('../utils/transmit');
const socket = require('../sync/socket');
const app = express();
const ca_download = require('../ssl/ca_download');
const connect =  require('../utils/connect');

function register(service) {
    app.use(service);
}

function run(ssl, port, cb) {
    const server = http.createServer();
    server.on('request', app);
    server.on('connect', ssl ? https.createServer(app) : connect);
    socket.start(server);
    register(ca_download);
    register(transmit({}));
    server.listen(port, cb);
}

exports.run = run;
exports.register = register;
