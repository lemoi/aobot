const chokidar = require('chokidar');

module.exports = function (root, options) {
    chokidar.watch(root, {
        ignored : /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    })
    .on('add', options.add)
    .on('change', options.change)
    .on('unlink', options.unlink)
    .on('unlinkDir', options.unlinkDir)
    .on('error', function(err) {
        throw err;
    });
}
