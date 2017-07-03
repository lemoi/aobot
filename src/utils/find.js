const fs = require('fs');
const path = require('path');

module.exports = function (root, context) {
    const files = context || {};
    function find(from) {
        if (fs.statSync(from).isDirectory()) {
            fs.readdirSync(from).forEach(function (file) {
                find(path.join(from, file));
            });
        } else {
            files['/' + path.posix.relative(root, from)] = fs.readFileSync(from, 'utf-8');
        }
    }
    find(root);
    return files;
}
