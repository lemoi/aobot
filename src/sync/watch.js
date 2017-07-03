const chokidar = require('chokidar');

const slots = ['add', 'change', 'unlink', 'unlinkDir', 'error'];

module.exports = function (root, options) {
    const watcher = chokidar.watch(root, {
        ignored : /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    });
    slots.forEach((key) => options[key] && watcher.on(key, options[key]));
}
