const header = require('../service/header');
const check = require('../utils/check');

const fields = {
    add: {
        type: 'object',
        required: false
    },
    del: {
        type: 'array',
        required: false
    }
};

module.exports = function (schedule, tasks, options) {
    schedule.record('header');
    check('header', options, fields);
    tasks.push(header(options.add || {}, options.del || []));
}
