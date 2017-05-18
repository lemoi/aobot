const url = require('url');
const request = require('follow-redirects').http.request;

const response = {
    filter: null, // RegExp
    func: function (req, res, next) {
        const urlObj = url.parse(req.url);

        if (response.filter.test(urlObj.hostname + urlObj.path)) {
            next();
            return;
        }

        const options = {
            method: req.method,
            headers: req.headers,
            path: urlObj.path,
            host: urlObj.hostname,
            port: urlObj.port || 80
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

        handle.end();
    }
};

module.exports = response;
