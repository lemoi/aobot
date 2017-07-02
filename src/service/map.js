const MIME = require('../utils/mime.json');
const path = require('path');
const parseurl = require('parseurl');

module.exports = function (context) {
    return function (req, res, next) {
        const pathname = parseurl(req).pathname;

        if (context.hasOwnProperty(pathname)) {

            res.setHeader('Content-Type', MIME[path.extname(pathname)]);
            res.statusCode = 200;
            res.send(context[pathname]);

        } else {
            next();
        }
    }
}
