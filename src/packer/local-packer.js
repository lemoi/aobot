const find = require('../utils/find');
const watch = require('../sync/watch');
const path = require('path');
const fs = require('fs');

module.exports = function (root, done) {
    const context = find(root);

    for (let file in context) {
        context['/' + path.posix.relative(root, file)] = context[file];
        delete context[file];
    }

    watch(root, {
        'add': (p) => context['/' + path.posix.relative(root, p)] = fs.readFileSync(p, 'utf-8'),
        'change': (p) => context['/' + path.posix.relative(root, p)] = fs.readFileSync(p, 'utf-8'),
        'unlink': (p) => delete context['/' + path.posix.relative(root, p)],
        'unlinkDir': (p) => {
            for (let i in context) {
                if (path.join(root, i).indexOf(p) === 0) {
                    delete context[i];
                    return;
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
