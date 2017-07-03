const response = require('./response');
const parseurl = require('parseurl');

module.exports = function ({ protocol, host, port, path }) {
    return function(req, res) {
        if (!protocol) {
            protocol = req.protocol
        }
        const ssl = protocol === 'https';
        const URL = parseurl(req);
        const options = {
            method: req.method,
            headers: req.headers,
            path: path || URL.path,
            host: host || URL.host || req.hostname,
            port: port || URL.port || (ssl ? 443 : 80),
            timeout: 2000
        };

        response(ssl, options, req, res);
    }
}
