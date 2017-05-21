const url = require('url');
const path = require('path');
const utils = require('./utils');

const response = {
    rules: null, // RegExp
    func: function (req, res, next) {
        const urlObj = url.parse(req.url);

        const rule = utils.matchRule(response.rules, urlObj.hostname, urlObj.pathname);

        if (rule !== null) {
            res.locals.real_path = urlObj.pathname.replace(rule.path, rule.resource);
            next();
            return;
        }

        const options = {
            method: req.method,
            headers: req.headers,
            path: urlObj.path,
            host: urlObj.hostname,
            port: urlObj.port || 80,
            timeout: 3000
        };

        utils.request(options, req, res);
    }
};

module.exports = response;
