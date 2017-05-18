const mapping = {
    map: null,
    func: function (req, res, next) {
        if (mapping.map.hasOwnProperty(req.path)) {
            // don't deflate for local resources
            res.removeHeader('content-encoding');
            res.send(mapping.map[req.path]);
            console.log('local: ' + req.path);
        } else {
            console.log('remote: ' + req.path);
            res.locals.proxy_response.on('data', function (data) {
                res.write(data);
            });
            res.locals.proxy_response.on('end', function () {
                res.end();
            });
        }
    }
};

module.exports = mapping;