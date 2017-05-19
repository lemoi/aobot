# Aobot

The aim of creating this project is to improve the experience when you develop with some repositories related with backend service.

Features should be included:

1. The repository depended with `fis` can run in the local environment.
2. It is easy enough to configure when debugging or testing in the mobile phone.

### Install

> sudo npm install -g byted-aobot

### How to use?

At the first step, you should create a file called  `aobot-conf.js` in your the project directory. 

Note: it's better to add `aobot-conf.js` to the `.gitignore` list.

The following is an exmaple of `ssad_fe/creative_wap`.

```js
module.exports = {
// development server ip and port
    remote: {
        ip: 'xx.x.xx.xx', 
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
            path: "/ad/m/index/"//,
            //resource: "/template/creative_wap/page/home.html"
        }]
    }]
}
```

Second, login in your dev-server and open the corresponding backend service.

Finally, run `aobot` in your project directory.
