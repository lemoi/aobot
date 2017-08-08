const fs = require('fs');
const path = require('path');

function find(from, to, context) {
    const fullPath = path.join(from, to);
    if (fs.statSync(fullPath).isDirectory()) {
        fs.readdirSync(fullPath).forEach(function (file) {
            find(fullPath, file, context);
        });
    } else {
        context[fullPath] = fs.readFileSync(fullPath, 'utf-8');
    }
}

module.exports = function (root) {
    const context = {};
    find(root, '', context);
    return context;
};
