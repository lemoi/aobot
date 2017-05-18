const path = require('path');
const fis = require('fis-bytedance');
const chokidar = require('chokidar');
const conf = 'fis-conf.js';

// @return mapping src
module.exports = function (src) {
    fis.project.setProjectRoot(src);
    require(path.join(src, conf));

    const files = fis.project.getSource();
    const opt = {};
    const collection = {};
    const ignoredReg = /[\\\/][_\-.\s\w]+$/i;

    opt.afterEach = function(file){
        if(file.release){
            collection[file.release] = file._content;
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
        err.message += fis.cli.colors.red('\n\tYou can set `fis.config.set("project.watch.usePolling", true)` fix it.');
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
        process.stdout.write('fis release successfully! \n');
    }

    release(opt);

    return collection;
}
