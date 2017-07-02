const path = require('path');
const config = require('../config');

module.exports = function (p) {
    if (path.isAbsolute(p)) {
        return p;
    } else {
        return path.join(config.project, p);
    }
}
