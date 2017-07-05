# Aobot
A development proxy tool like Charles but more powerful

Install: `npm install -g byted-aobot`

note: if it failed, try to use **sudo**.

## Guide
To use aobot, you should create a file called `aobot-conf.js`(specify an another file by using `-f` option).

```js
// aobot-conf.js
module.exports = function (aobot) {
    aobot.enableSSL();
    aobot.route({
        host: 'mysite.com',
    }).pipe('path', {
        from: '/proxy/(.*)',
        to: '/$1'
    }).pipe('local', {
        path: 'public'
    }).pipe('remote', {
        protocol: 'http',
        host: '10.6.131.79',
        port: 17419
    });

    aobot.route({
        host: 'mysite.com',
        path: '/static'
    }).pipe('local', {
        path: 'public'
    });

    aobot.listen(8888)
}
```

## CLI
```bash
  Usage: aobot [options]

  Options:

    -V, --version              output the version number
    -p, --project <directory>  project directory
    -f, --file <file>          config file
    -s, --ssl                  get ssl root certificate
    -i, --ip                   output local ip
    -h, --help                 output usage information
```

## API
- enableSSL
- route
- service
    - remote
    - local
    - path
    - fis
- listen

### enableSSL()
The default behavior of treating https is just transmiting the requests.

So, you should call this to enable https proxy.

Of course, you must download the root certificat following steps by `aobot -s`.

### route(options)
The route decides what kind of urls will be hijacked and which pipeline used for handling request.

```js
options = {
    // "http", "https", ignored means all
    protocol: {
        type: 'string',
        required: false
    },
    // an regex string, like "www.google.com", "google.com|facebook.com", ignored means all
    host: {
        type: 'string',
        required: false       
    },
    // number, 8080, 3000, ignored means all
    port: {
        type: 'number',
        required: false
    },
    // match for the total url, eg: "/static" , ignored means all
    path: {
        type: 'string',
        required: false
    }
}
```

### service
The service is a pipeline unit representing how to response with the corresponding route.

#### remote(options)
```js
// just like the options in route
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

#### local(options)
Directry served for request.

```js
options = {
    path: {
        type: 'string',
        required: true
    }
}
```

#### path(options)
Path replace using the javacript `String.replace`

```js
options = {
    from: {
        type: 'string',
        required: true
    },
    to: {
        type: 'string' | 'function,
        required: true
    }
}
```

#### fis(options)
Fis2 config options

```js
options = {
    project: {
        type: 'string',
        required: false        
    },
    deploy: {
        type: 'string',
        required: true,
    },
    upload: {
        type: 'object',
        required: false
    }
}

upload = {
    filter: {
        type: 'string',
        required: false
    },
    ssh: {
         type: 'object',
         required: false       
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

### listen(port)
The function called to listen port, only can be called once.

```js
aobot.route({}).pipe('remote', {}).listen(3000)

// equal to 
aobot.route({}).pipe('remote', {})
aobot.listen(30000)

// but, if you have multiple route
aobot.route({
    host: 'google.com'
})...

aobot.route({
    host: 'gmail.com'
})...

// it's better to use
aobot.listen(3000)
```js
