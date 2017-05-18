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
    ]
}

**/    

const fs = require('fs');
const path = require('path');

const file = 'aobot-conf.js';

const prjRoot = path.join(process.cwd(), 'pgcpromotion_mobile');

let config;

try {
    config = require(path.join(prjRoot, file));
} catch (e) {
    process.stderr.write('Can\'t find the config file -> aobot-config.js. \n');
    throw e;
}

module.exports = {
    prjRoot: prjRoot,
    config: config
};
