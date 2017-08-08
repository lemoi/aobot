const replace = require('../service/path');
const check = require('../utils/check');

const fields = {
    from: {
        type: 'string',
        required: true
    },
    to: {
        type: 'string',
        required: true
    }
};

module.exports = function (schedule, tasks, options) {
    check('path', options, fields);
    schedule.record('path');
    tasks.push(replace(options.from, options.to));
}
