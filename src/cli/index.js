const server = require('../server');

// server.config.setMapping({});

// server.config.setProxy('10.6.131.79', 17419);

// server.config.seFilter(/^ad.toutiao.com|^i.snssdk.com\/ad\/m/);

// server.run();

var net = require('os').networkInterfaces();
for(var key in net){
    if(net.hasOwnProperty(key)){
        var details = net[key];
        if(details && details.length){
            for(var i = 0, len = details.length; i < len; i++){
                var ip = String(details[i].address).trim();
                if(ip && /^\d+(?:\.\d+){3}$/.test(ip) && ip !== '127.0.0.1'){
                    console.log(ip)
                }
            }
        }
    }
}