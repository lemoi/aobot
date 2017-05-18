const express = require('express');
const mapping = require('./mapping');
const proxy = require('./proxy');
const response = require('./response');
const connectHandle = require('./connectHandle');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();

app.use('/', function (req, res, next) {
    //console.log(req.url);
    next();
});

app.use('/', response.func);
app.use('/', proxy.func);
app.use('/', mapping.func);

function run(port, cb) {
    const server = http.createServer();
    server.on('request', app);
    server.on('connect', connectHandle); // https

    server.listen(port, cb);
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
