const url = require('url');
const request = require('follow-redirects').http.request;
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

        const handle = request(options, (result) => {
            const headers = result.headers;
            res.statusCode = result.statusCode;

            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    res.setHeader(key, headers[key]);
                }
            }

            result.on('data', function (data) {
                //console.log('response', req.url);
                res.write(data);
            });
            result.on('end', function () {
                res.end();
            });
        });

        handle.on('error', function (err) {
            console.log('error: request error -> ' + req.url + '. ');
        });
        
        handle.end();
    }
};

module.exports = response;
