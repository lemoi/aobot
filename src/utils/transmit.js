const response = require('./response');
const parseurl = require('parseurl');

module.exports = function ({ protocol, host, port, path }) {
    return function(req, res) {

        const ssl = protocol ? protocol === 'https' : req.secure;
        const URL = parseurl(req);

        const options = {
            method: req.method,
            headers: req.headers,
            path: path || URL.path,
            host: host || URL.hostname || req.hostname,
            port: port || URL.port || (ssl ? 443 : 80),
            timeout: 2000
        };

        response(ssl, options, req, res);
    }
}
