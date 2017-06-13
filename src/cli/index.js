const server = require('../server');
const fis = require('../packer/fis-packer');
const path = require('path');
const { config, prjRoot } = require('./config');
const net = require('os').networkInterfaces()

let localIp;

for (let key in net){
    if (net.hasOwnProperty(key)) {
        let details = net[key];
        if (details && details.length) {
            for (let i = 0, len = details.length; i < len; i++){
                const ip = String(details[i].address).trim();
                if(ip && /^\d+(?:\.\d+){3}$/.test(ip) && ip !== '127.0.0.1'){
                    localIp = ip;
                    break;
                }
            }
        }
    }
}

server.config.setRules(config.rules);
server.config.setProxy(config.remote.ip, config.remote.port);

fis(prjRoot, config.fis.deploy, config.local.port, function (collection) {
    server.config.setMapping(collection);

    server.run(config.local.port, function () {
        process.stdout.write('Aobot server is running. \n');
        process.stdout.write(`You can access it in the address 127.0.0.1:${config.local.port} or ${localIp}:${config.local.port}. \n`);
    });
});
