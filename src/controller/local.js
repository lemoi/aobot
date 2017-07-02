const local = require('../service/local');
const check = require('../utils/check');
const fullpath = require('../utils/fullpath');

const fields = {
    path: {
        type: 'string',
        required: true
    }
};

module.exports = function (schedule, tasks, options) {
    check('local', options, fields);
    schedule.record('local');
    tasks.push(local(fullpath(options.path)));
}
