const fs = require('fs');
const path = require('path');
const log = require('./utils/log');

const config = {
    project: process.cwd(),
    version: require('../package.json').version,
    file: 'aobot-conf.js'
};

config.get = function () {
    try {
        return require(path.isAbsolute(this.file) ? this.file : path.join(this.project, this.file));
    } catch (e) {
        log.error('can\'t find the config file -> aobot-config.js');
        throw e;
    }
}

module.exports = config;
