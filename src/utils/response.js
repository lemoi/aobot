module.exports = function(ssl, options, req, res) {

    const remoteRequest = require(ssl ? 'https' : 'http')
        .request(options, function(remoteResponse) {

            remoteResponse.headers['proxy-agent'] = 'Aobot Proxy';

            // write out headers to handle redirects
            res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);

            remoteResponse.pipe(res);

            // Res could not write, but it could close connection
            res.pipe(remoteResponse);
        });

    remoteRequest.on('error', function(e) {
        res.writeHead(502, 'Proxy fetch failed');
        res.end('Proxy fetch failed');
        remoteRequest.end();
    });

    req.pipe(remoteRequest);

    // Just in case if socket will be shutdown before http.request will connect
    // to the server.
    res.on('close', function() {
        remoteRequest.abort();
    });
};
