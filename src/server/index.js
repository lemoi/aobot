const express = require('express');
const http = require('http');
const https = require('../utils/https');
const socket = require('../sync/socket');
const app = express();
const ca_download = require('../ssl/ca_download');

function register(service) {
    app.use('/', service);
}

function run(port, cb) {
    const server = http.createServer();

    server.on('request', app);
    server.on('connect', https.createServer(app));
    socket.start(server);
    register(ca_download);
    
    server.listen(port, cb);
}

exports.run = run;
exports.register = register;
