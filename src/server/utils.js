/* 
[{
    domain: ["ad.toutiao.com", "i.snssdk.com"],
    rule: [{
        path: "/static/(.*)",
        resource: "$1"
    },
    {
        path: "/ad/m/index/",
        resource: ""
    }]
},
]
*/
module.exports.matchRule = function (rules, domain, path) {
    let rule = null;
    for (let r of rules) {
        for (let d of r.domain) {
            if (RegExp(d).test(domain)) {
                rule = r.rule;
                break;
            }
        }
        if (rule !== null) {
            break;
        }
    }
    if (rule !== null) {
        for (let l of rule) {
            const pregex = RegExp(l.path);
            if (pregex.test(path)) {
                rule = {
                    path: pregex,
                    resource: l.resource
                };
                break;
            }
        }
    }
    return rule;
}

module.exports.mime = {
    //text
    '.css' : 'text/css',
    '.tpl' : 'text/html',
    '.js' : 'text/javascript',
    '.jsx' : 'text/javascript',
    '.php' : 'text/html',
    '.asp' : 'text/html',
    '.jsp' : 'text/jsp',
    '.txt' : 'text/plain',
    '.json' : 'application/json',
    '.xml' : 'text/xml',
    '.htm' : 'text/html',
    '.text' : 'text/plain',
    '.md' : 'text/plain',
    '.xhtml' : 'text/html',
    '.html' : 'text/html',
    '.conf' : 'text/plain',
    '.po' : 'text/plain',
    '.config' : 'text/plain',
    '.coffee' : 'text/javascript',
    '.less' : 'text/css',
    '.sass' : 'text/css',
    '.scss' : 'text/css',
    '.styl' : 'text/css',
    '.manifest' : 'text/cache-manifest',
    //image
    '.svg' : 'image/svg+xml',
    '.tif' : 'image/tiff',
    '.tiff' : 'image/tiff',
    '.wbmp' : 'image/vnd.wap.wbmp',
    '.webp' : 'image/webp',
    '.png' : 'image/png',
    '.bmp' : 'image/bmp',
    '.fax' : 'image/fax',
    '.gif' : 'image/gif',
    '.ico' : 'image/x-icon',
    '.jfif' : 'image/jpeg',
    '.jpg' : 'image/jpeg',
    '.jpe' : 'image/jpeg',
    '.jpeg' : 'image/jpeg',
    '.eot' : 'application/vnd.ms-fontobject',
    '.woff' : 'application/font-woff',
    '.woff2' : 'application/font-woff',
    '.ttf' : 'application/octet-stream',
    '.cur' : 'application/octet-stream'
};



module.exports.request = function(options, req, res) {

    var remoteRequest = require('http').request(options, function(remoteResponse) {

        remoteResponse.headers['proxy-agent'] = 'Aobot Proxy';

        // write out headers to handle redirects
        res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);

        remoteResponse.pipe(res);

        // Res could not write, but it could close connection
        res.pipe(remoteResponse);
    });

    remoteRequest.on('error', function(e) {

        res.writeHead(502, 'Proxy fetch failed');
        res.end();
        remoteRequest.end();
        console.log('error: proxy error -> ' + req.url + '. ');
    });

    req.pipe(remoteRequest);

    // Just in case if socket will be shutdown before http.request will connect
    // to the server.
    res.on('close', function() {
        remoteRequest.abort();
    });
}
