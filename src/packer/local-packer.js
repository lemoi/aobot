const find = require('../utils/find');
const watch = require('../sync/watch');

module.exports = function (path, done) {
    const context = find(path);

    watch(path, {
        'add': (path) => find(path, context),
        'change': (path) => find(path, context),
        'unlink': (path) => delete context[path],
        'unlinkDir': (path) => {
            for (let i in context) {
                if (i.indexOf(path) === 0) {
                    delete context[i];
                }
            }
        },
        'error': (err) => {
            throw err;
        }
    });

    done();
    return context;
}
