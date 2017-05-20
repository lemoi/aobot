const path = require('path');
const fis = require('fis-bytedance');
const chokidar = require('chokidar');
const conf = 'fis-conf.js';
const spawn = require('child_process').spawn;
const url = require('url');

function runRcv(usr, address, port, cb) {
    const ssh = spawn('ssh', [usr + '@' + address, '\""fisrcv ' + port + '\""']);
    let killed = false;

    ssh.on('error', (err) => {
        cb('error', err);
    });

    ssh.stdout.on('data', (data) => {
        ssh.kill();
        data = data.toString();
        if (data.indexOf('receiver listening') !== -1) {
            cb('success', data);
        } else {
            cb('stdout', data);
        }
    });

    ssh.stderr.on('data', (data) => {
        ssh.kill();
        data = data.toString();
        if (data.indexOf('listen EADDRINUSE') !== -1) {
            cb('success', data);
        } else if (data.indexOf('Kill') === -1) {
            cb('stderr', data);
        }
    });
}

// @return mapping src
module.exports = function (src, deploy, cb) {
    fis.project.setProjectRoot(src);
    require(path.join(src, conf));

    const files = fis.project.getSource();
    const collection = {};
    const ignoredReg = /[\\\/][_\-.\s\w]+$/i;

    const syn = RegExp(deploy.upload);

    let deployConfig;
    try {
        deployConfig  = fis.config.get('deploy')[deploy.item] || null;
    } catch (e) {
        process.stderr.write('Can\'t find the fis deploy item -> ' + deploy + ' . \n');
        throw e;
    }

    const opt = {};
    opt.afterEach = function (file){
        const release = file.release;
        let content = file._content;

        if(release){
            collection[release] = content;

            if (deployConfig && deploy.upload && syn.test(file.release)) {
                deployConfig.forEach(function (rule) {

                    if (!rule.from
                        ||(file.release.startsWith(rule.from)
                        && fis.util.filter(file.release, rule.include, rule.exclude))) {

                        if(file.isText() && content.length) {

                            if(rule.replace && rule.replace.from) {

                                let reg = rule.replace.from;
                                
                                if(typeof reg === 'string') {
                                    reg = new RegExp(fis.util.escapeReg(reg), 'g');
                                } else if(!(reg instanceof RegExp)) {
                                    process.stderr.write('invalid deploy.replace.from [' + reg + ']');
                                }

                                content = content.replace(reg, rule.replace.to);
                            }
                            fis.util.upload(rule.receiver, null, { to : rule.to + release }, content, file.subpath,
                                function (err, data) {
                                    if (err) {
                                        process.stderr.write('error: upload error -> from: ' + release
                                        + 'to: ' + rule.to + release + '. \n');
                                    } else {
                                        process.stdout.write('upload: ' + release + '. \n');
                                    }
                            });
                        }
                    } 
                });   
            }
        }
    };

    function listener(type){
        return function (path) {
            var p, timer;
            if(ignoredReg.test(path)){
                var path = fis.util(path);
                if (type == 'add' || type == 'change') {
                    if (opt.srcCache.indexOf(path) == -1) {
                        opt.srcCache.push(path);
                    }
                } else if (type == 'unlink') {
                    if ((p = opt.srcCache.indexOf(path)) > -1) {
                        opt.srcCache.splice(p, 1);
                    }
                } else if (type == 'unlinkDir') {
                    var toDelete = [];

                    opt.srcCache.forEach(function(realpath, index) {
                        realpath.indexOf(path) === 0 && toDelete.unshift(index);
                    });

                    toDelete.forEach(function(index) {
                        opt.srcCache.splice(index, 1);
                    });
                }
                clearTimeout(timer);
                timer = setTimeout(function() {
                    process.stdout.write(`modify: ${path}. \n`);
                    release(opt);
                }, 500);
            }
        };
    }

    chokidar.watch(src, {
        ignored : /(^|[\/\\])\../,
        usePolling: fis.config.get('project.watch.usePolling', null),
        persistent: true,
        ignoreInitial: true
    })
    .on('add', listener('add'))
    .on('change', listener('change'))
    .on('unlink', listener('unlink'))
    .on('unlinkDir', listener('unlinkDir'))
    .on('error', function(err) {
        throw err;
    });

    fis.util.map(files, function (subpath, file) {
        opt.srcCache = opt.srcCache || [];
        opt.srcCache.push(file.realpath);
    });

    function release(opt) {
        for (let p in collection) {
            delete collection[p];
        }
        fis.release(opt);
        process.stdout.write('Fis released successfully! \n');
    }

    if (deployConfig) {
        const receivers = {};
        deployConfig.forEach(function (rule) {
            const rcv = url.parse(rule.receiver);
            receivers[rule.receiver] = {
                hostname: rcv.hostname,
                port: rcv.port
            }
        });

        for (let rcv in receivers) {
            const receiver = receivers[rcv];
            const usr = deploy.devSeverUsr || deploy.item;
            runRcv(usr, receiver.hostname, receiver.port, function (type, data) {

                if (type === 'success'){
                    process.stdout.write('Receiver(' + rcv + ') started successfully! \n');
                    release(opt);
                    cb(collection);
                } else {
                    throw new Error(data);
                }
            });
        }

    } else {
        release(opt);
        cb(collection);
    }

    return collection;
}
