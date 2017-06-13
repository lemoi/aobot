/**
aobot-config.js

module.exports = {
    remote: {
        ip: '10.6.131.79'
        port: 17419
    },
    local: {
        port: 8888
    },
    rules: [
        {
            path: "^/static/(.*)",
            resource: "/$1"
        },
        {
            path: "/ad/m/index/"//,
            //resource: "/template/creative_wap/page/home.html"
        }
    ],
    fis: {
        deploy: {
            item: 'houwenjie',
            upload: '/template',
            devSeverUsr: 'houwenjie'
        }
    }
}

**/

const fs = require('fs');
const path = require('path');

const file = 'aobot-conf.js';

const prjRoot = process.cwd();

let config;

try {
    config = require(path.join(prjRoot, file));
    config.fis = config.fis || {}
} catch (e) {
    process.stderr.write('Can\'t find the config file -> aobot-config.js. \n');
    throw e;
}

module.exports = {
    prjRoot: prjRoot,
    config: config
};
