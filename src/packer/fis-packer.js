const readFile = require('fs').readFileSync;
const path = require('path');
const fis = require('fis');
const release = require('fis-kernel');

const file = 'fis-conf.js';

// @return mapping src
module.exports = function (dir) {
    const config = readFile(path.join(dir, file), 'utf8');

}
