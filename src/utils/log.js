const chalk = require('chalk');

const out = console.log;
const err = console.error; 

module.exports = {
    default: function (what) {
        out(what);
    },
    info: function (what) {
        out(chalk.blue(what));
    },
    success: function (what) {
        out(chalk.green(what));
    },
    warn: function (what) {
        out(chalk.yellow(what));
    },
    error: function (what) {
        err(chalk.red(what));
    }
}
