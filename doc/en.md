# Aobot
powerful development tools

```js
module.exports = function (aobot) {
    aobot.route({
        //protocol: '', // http | https | *
        host: 'ad.toutiao.com|i.snssdk.com', // regex
        //port: '',
        //path: '' // regex
    }).pipe('path', {
        from: '^/ad/static/(.*)',
        to: '/$1'
    }).pipe('fis', {
        project: '',
        deploy: 'houwenjie',
        upload: {
            filter: '/template',
            ssh: {
                ip: '10.6.131.79',
                port: 22,
                user: 'houwenjie'                
            }
        }
    }).pipe('remote', {
        //protocol: '', // http | https | *
        host: '10.6.131.79',
        port: 17419,
       // path: ''
    });
    aobot.route({}).pipe('remote', {});
    aobot.listen(8888);
}
```

- route
- service
    - remote
    - local
    - path
    - fis
- listen
