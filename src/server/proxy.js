const url = require('url');
const utils = require('./utils');

const proxy = {
    remote: {
        https: false,
        host: null,
        port: null
    },
    func: function (req, res, next) {
        const search = url.parse(req.url).search;

        if (req.path === '/socket.io/') {
            next();
            return;
        }

        const options = Object.assign({
            method: req.method,
            headers: req.headers,
            path: req.path,
            timeout: 3000
        }, proxy.remote);

        if (search !== null) {
            options.path += search;
        }

        utils.request(options, req, res);
    }
};

module.exports = proxy;
