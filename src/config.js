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
        }
    ],
    fis: {
        deploy: { 
            item: 'houwenjie',
            upload: '/template',
            devSeverUsr: 'houwenjie',
            password: ''
        }
    },
    map: ['a', 'b']
}

module.exports = function (aobot) {
    aobot.route({
        protocol: '*', // http | https | *
        host: 'ad.toutiao.com | i.snssdk.com', // regex
        port: 80,
        path: '' // regex
    }).pipe('replace', (
        '^/ad/static/(.*)',
        '/$1'
    ).pipe('fis', {
        project: '',
        deploy: 'houwenjie',
        upload: {
            path: '/template',
            ssh: {
                ip: '',
                port: '',
                user: ''
                password: '',                  
            }
        }
    }).pipe('remote', {
        protocol: '*', // http | https | *
        host: '127.0.0.01',
        port: 80,
        path: ''
    }).pipe('local', {
        path: 
    });

    aobot.route();
    aobot.local('');
    aobot.listen(8888);
}

**/    

const fs = require('fs');
const path = require('path');

const file = 'aobot-conf.js';

const config = {
    project: process.cwd(),
    version: require('../package.json').version
};

config.get = function () {
    try {
        return require(path.join(this.project, file));
    } catch (e) {
        process.stderr.write('Can\'t find the config file -> aobot-config.js. \n');
        throw e;
    }
}

module.exports = config;
