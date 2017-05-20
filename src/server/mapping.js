const mapping = {
    map: null,
    func: function (req, res, next) {

        // disable cache
        res.removeHeader('etag');
        res.removeHeader('expires');
        res.removeHeader('cache-control');
        res.removeHeader('last-modified');
        console.log(req.path);
        if (mapping.map.hasOwnProperty(res.locals.real_path)) {
            // don't deflate for local resources
            res.removeHeader('content-encoding');
            res.statusCode = 200;

            res.send(mapping.map[res.locals.real_path]);
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