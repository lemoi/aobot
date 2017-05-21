const url = require('url');
const utils = require('./utils');

const proxy = {
    remote: {
        host: null,
        port: null
    },
    func: function (req, res, next) {
        const search = url.parse(req.url).search;

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
