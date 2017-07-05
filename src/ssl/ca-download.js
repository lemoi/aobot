const config = require('./config');
const fs = require('fs');

module.exports = function (req, res, next) {
    
    if (req.url === config.ca_download_url) {
        res.download(config.output.root.cert, 'aobotCA.crt');
    } else {
        next();
    }
}
