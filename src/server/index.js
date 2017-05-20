const express = require('express');
const mapping = require('./mapping');
const proxy = require('./proxy');
const response = require('./response');
const connectHandle = require('./connectHandle');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const app = express();

app.use('/', function (req, res, next) {
    // console.log(req.url);
    // res.end('1222');
    next();
});

app.use('/', response.func);
app.use('/', proxy.func);
app.use('/', mapping.func);

// const httpsOptions = {
//     key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
// };

function run(port, cb) {
    const server = http.createServer();
    //const httpServer = http.createServer(app);
    // const httpsServer = https.createServer(httpsOptions, app);

    server.on('request', app);
    server.on('connect', connectHandle); // https

    server.listen(port, cb);
    //httpServer.listen(port, cb);
    //httpsServer.listen(port);
}

const config = {

    setMapping: function (map) {
        mapping.map = map;
    },

    setProxy: function (host, port) {
        proxy.remote.host = host;
        proxy.remote.port = port;
    },

    setRules: function (rules) {
        response.rules = rules;
    }
}

exports.run = run;
exports.config = config;
