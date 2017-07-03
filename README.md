# Aobot
powerful development tools

install: `npm install -g byted-aobot --registry http://npm.byted.org`

note: if it failed, try to use **sudo**.

```js
module.exports = function (aobot) {
    aobot.route({
        host: 'ad.toutiao.com|i.snssdk.com',
    }).pipe('path', {
        from: '^/ad/static/(.*)',
        to: '/$1'
    }).pipe('fis', {
        project: '',
        deploy: 'xxx',
        upload: {
            filter: '/template',
            ssh: {
                ip: '10.6.131.79',
                port: 22,
                user: 'xxx'                
            }
        }
    }).pipe('remote', {
        host: '10.6.131.79',
        port: 17419
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


## route(options)
The route decides what kind of urls will be hijacked. 

```js
options = {
    protocol: {
        type: 'string',
        required: false
    },
    host: {
        type: 'string',
        required: false       
    },
    port: {
        type: 'number',
        required: false
    },
    path: {
        type: 'string',
        required: false
    }
}
```

## service
The service is a pipeline representing how to response with the corresponding route.

#### remote(options)
```js
options = {
    protocol: {
        type: 'string',
        required: false
    },
    host: {
        type: 'string',
        required: false     
    }, // regex
    port: {
        type: 'number',
        required: false
    },
    path: {
        type: 'string',
        required: false
    }
}
```

#### local(options)
```js
options = {
    path: {
        type: 'string',
        required: true
    }
}
```

#### path(options)
```js
options = {
    from: {
        type: 'string',
        required: true
    },
    to: {
        type: 'string',
        required: true
    }
}
```

#### fis(options)
```js
options = {
    project: {
        type: 'string',
        require: false        
    },
    deploy: {
        type: 'string',
        require: true,
    },
    upload: {
        type: 'object',
        require: false
    }
}

upload = {
    filter: {
        type: 'string',
        require: false
    },
    ssh: {
         type: 'object',
         require: false       
    }
}

ssh = {
    ip: {
        type: 'string',
        required: true
    },
    port: {
        type: 'number',
        required: false
    },
    user: {
        type: 'string',
        required: true        
    }
}
```

## listen(port)
The function called to listen port.
