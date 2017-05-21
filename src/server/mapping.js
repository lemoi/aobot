const utils = require('./utils');
const path = require('path');

const mapping = {
    map: null,
    func: function (req, res, next) {

        // disable cache
        if (mapping.map.hasOwnProperty(res.locals.real_path)) {
            // don't deflate for local resources
            // res.removeHeader('content-encoding');
            res.setHeader('Content-Type', utils.mime[path.extname(req.path)]);
            res.statusCode = 200;

            res.send(mapping.map[res.locals.real_path]);
            console.log('local: ' + req.path);
        } else {
            console.log('remote: ' + req.path);
            next();
        }
    }
};

module.exports = mapping;