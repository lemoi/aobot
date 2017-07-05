const controller = require('../controller');
const config = require('../config');
const path = require('path');
const commander = require('commander');
const log = require('../utils/log');

commander
    .version(config.version)
    .option('-p, --project <directory>', 'project directory')
    .option('-f, --file <file>', 'config file')
    .option('-s, --ssl', 'get ssl root certificate')
    .option('-i, --ip', 'output local ip')
    .parse(process.argv);

if (commander.ssl) {
    log.info(`download the root certificate in ${require('../ssl/config').ca_download_url} when service started`);
    process.exit();
} else if (commander.ip) {
    log.info(`local ip -> ${require('../utils/localip')}`);
    process.exit();
}

if (commander.project) {
    config.project = commander.project;
    if (!path.isAbsolute(config.project)) {
        config.project = path.join(process.cwd(), config.project);
    }
}

if (commander.file) {
    config.file = commander.file;
}

config.get()(controller);
