# Aobot

The aim of creating this project is to improve the experience when you develop with some repositories related with backend service.

Features should be included:

1. The repository depended with `fis` can run in the local environment.
2. It is easy enough to configure when debugging or testing in the mobile phone.
3. Get rid of configuring the messy remote developing machine.

### Install

> sudo npm install -g byted-aobot

### How to use?

#### Firstly
You should create a file called  `aobot-conf.js` in your the project directory.

Note: it's better to add `aobot-conf.js` to the `.gitignore` list.

The following is an exmaple of `ssad_fe/creative_wap`.

```js
module.exports = {
    // A string or a function to substitude the 'GLOBAL_VAR' part of html like file.
    // If your want to dynamically substitude this part, pass a function like:
    // function (whereTheHTMLFileIs) {
    //   return theGlobalVarString;
    // }
    // If you do not need this feature, pass 'false' or leave it empty.
    globalVarInjection: 'XXXXXX',

    // developing server ip/host and port
    // You can also pass a online server host and port
    remote: {
        https: false,
        host: 'xx.x.xx.xx',
        port: xxxx
    },
    // binding local port
    local: {
        port: xxxx
    },

    // mapping rules
    rules: [{
        domain: ['ad.toutiao.com', 'i.snssdk.com'],
        rule:[{
            path: "^/static/(.*)",
            resource: "/$1"
        },
        {
            // map template file
            path: '^/overture/index/',
            resource: '/template/creative_web/page/index.html'
        }]
    }],

    // fis deploy config，not necessary.
    fis: {
        deploy: {
            item: 'xxxxxx', // -d
            upload: '/template',
            devSeverUsr: 'xxxxxx'
        }
    }
}
```

#### Secondly

If your wan't use the dirty remote developing server stubbornly, make sure these things:

1. You can ssh to the developing server with ssh-key.
1. You did configure the server properly, like right git permission, port configuration, etc.
1. Run you backend service on developing server.

#### Thirdly

run `aobot` in your project directory.

#### Finally
Set your browser proxy to `aobot` and develop happly.

### Showcase

Repo: gitr:ssad\_fe/creative\_web
Branch: oversea-district
