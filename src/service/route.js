const parseurl = require('parseurl');

module.exports = function ({ protocol, host, port, path }, tasks) {

    host && (host = RegExp(host));
    path && (path = RegExp(path));

    return function (req, res, next) {
        const URL = parseurl(req);
        if ((!protocol || req.protocol === protocol) &&
            (!host || host.test(req.hostname)) &&
            (!port || URL.port === port) &&
            (!path || path.test(URL.pathname))) {

            let stop = false;
            for (let i = 0; i < tasks.length && !stop; i++) {
                stop = true;
                tasks[i](req, res, () => stop = false);
            }
            if (!stop) {
                next();
            }
        } else {
            next();
        } 
    }
}
