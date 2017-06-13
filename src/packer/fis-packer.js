const path = require('path');
const fis = require('fis-bytedance');
const chokidar = require('chokidar');
const conf = 'fis-conf.js';
const spawn = require('child_process').spawn;
const url = require('url');
const genBrowserCode = require('../sync/browser');
const socket = require('../sync/socket');
const log = require('../server/log')

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
module.exports = function ({src, globalVarInjection, deploy, syncPort}, cb) {
    fis.project.setProjectRoot(src);
    require(path.join(src, conf));
    //console.log(fis.config.get('settings'))
    const files = fis.project.getSource();
    const collection = {};
    const ignoredReg = /[\\\/][_\-.\s\w]+$/i;
    const browserSyncCode = genBrowserCode(syncPort);
    let syn;
    let deployConfig = false;

    if (deploy) {
      try {
          syn = new RegExp(deploy.upload);
          deployConfig = fis.config.get('deploy')[deploy.item];
      } catch (e) {
          process.stderr.write('Can\'t find the fis deploy item -> ' + deploy + ' . \n');
          throw e;
      }
    }

    const opt = {};

    fis.util.map(files, function (subpath, file) {
        opt.srcCache = opt.srcCache || [];
        opt.srcCache.push(file.realpath);
    });

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
                    socket.refresh();
                }, 500);
            }
        };
    }

    function watch() {
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
    }

    function upload(file) {
        if (!deployConfig || !syn.test(file.release)) {
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

    function release(opt) {
        for (let p in collection) {
            delete collection[p];
        }
        fis.release(opt, function (ret) {
            let handleHTMLFile = function (_, file) {
                if (file.isHtmlLike) {
                    let fileContent = file.getContent()
                    if (globalVarInjection) {
                      // remove the python template tag
                      fileContent = fileContent.replace(/{% .* %}/g, '');

                      // substitude the GLOBAL_VAR
                      fileContent = fileContent.replace(/var\s*GLOBAL_VAR\s*=\s*({[^;]*)/gm, function () {
                        if (typeof globalVarInjection === 'function') {
                          return globalVarInjection(file.fullname);
                        } else {
                          return globalVarInjection;
                        }
                      })
                    }

                    fileContent += browserSyncCode; // 添加自动刷新代码

                    file.setContent(fileContent);
                }
                collection[file.release] = file.getContent();
                deploy && deploy.upload && deployConfig && upload(file);
            };

            fis.util.map(ret.src, handleHTMLFile);
            fis.util.map(ret.ids, handleHTMLFile);
        });
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

                if (type == 'success'){
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
    watch();

    return collection;
}
