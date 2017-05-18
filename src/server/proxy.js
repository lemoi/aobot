const url = require('url');
const request = require('follow-redirects').http.request;

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

        req = request(options, (result) => {
            const headers = result.headers;
            res.statusCode = result.statusCode;
            
            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    res.setHeader(key, headers[key]);
                }
            }
            res.locals.proxy_response = result;
            next();
        });

        req.on('error', function (err) {
            console.log('error: request error -> ' + req.url + '. ');
        });
        
        req.end();
    }
};

module.exports = proxy;
