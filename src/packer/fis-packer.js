const path = require('path');
const fis = require('fis-bytedance');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const url = require('url');
const browser = require('../sync/browser');
const socket = require('../sync/socket');
const fullpath = require('../utils/fullpath');
const log = require('../utils/log');

function runRcv(ssh, fisrcvPort, cb) {
    ssh = spawn('ssh', ['-p', ssh.port || 22, ssh.user + '@' + ssh.ip, '\""fisrcv ' + fisrcvPort + '\""']);
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

const conf = 'fis-conf.js';

// @return mapping src
module.exports = function ({ project, deploy, upload }, cb) {

    project = fullpath(project || '.');
    fis.project.setProjectRoot(project);

    require(path.join(project, conf));

    //console.log(fis.config.get('settings'))
    const files = fis.project.getSource();
    const ignoredReg = /[\\\/][_\-.\s\w]+$/i;
    const context = {};
    // const browserCode = genBrowserCode(syncPort);

    let deployConfig;
    try {
        deployConfig  = fis.config.get('deploy')[deploy] || null;
    } catch (e) {
        log.error('fis: can\'t find the fis deploy item -> ' + deploy);
        throw e;
    }

    const opt = {};

    fis.util.map(files, function (subpath, file) {
        opt.srcCache = opt.srcCache || [];
        opt.srcCache.push(file.realpath);
    });

    let timer = null;
    function listener(type){
        return function (path) {
            var p;
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
                    log.info(`fis: modify -> ${path}`);
                    release(opt, () => socket.refresh());
                }, 200);
            }
        };
    }

    function watch() {
        chokidar.watch(project, {
            ignored : /(^|[\/\\])\../,
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
    }

    const pathRegex = RegExp(upload.filter);

    function uploadFile(file) {
        if (!pathRegex.test(file.release)) {
            return;
        }

        const release = file.release;
        let content = file.getContent();

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
                            log.error('fis: invalid deploy.replace.from [' + reg + ']');
                        }

                        content = content.replace(reg, rule.replace.to);
                    }
                    fis.util.upload(rule.receiver, null, { to : rule.to + release }, content, file.subpath,
                        function (err, data) {
                            if (err) {
                                log.error('fis: upload error -> from: ' + release
                                + 'to: ' + rule.to + release);
                            } else {
                                log.default('fis: uploaded -> ' + release);
                            }
                    });
                }
            } 
        });
    }

    function release(opt, done) {
        for (let p in context) {
            delete context[p];
        }
        fis.release(opt, function (ret) {
            browser.code((code) => {
                fis.util.map(ret.src, function (subpath, file) {
                    if (file.isHtmlLike) {
                        file.setContent(file.getContent() + code);
                    }
                    context[file.release] = file.getContent();
                    upload && upload.ssh && uploadFile(file);
                });

                fis.util.map(ret.ids, function (id, file) {
                    if (!context.hasOwnProperty(file.release)) {
                        if (file.isHtmlLike) {
                            file.setContent(file.getContent() + code);
                        }
                        context[file.release] = file.getContent();
                        upload && upload.ssh && uploadFile(file);
                    }
                });
                log.success('fis: released successfully!');
            });
            done();
        });
    }

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
        runRcv(upload.ssh, receiver.port, function (type, data) {

            if (type == 'success'){
                log.success('fis: receiver(' + rcv + ') started successfully!');
                release(opt, () => cb(context));
            } else {
                throw new Error(data);
            }
        });
    }

    watch();
    return context;
}
