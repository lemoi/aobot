const remote = require('../service/remote');
const check = require('../utils/check');

const fields = {
    protocol: {
        type: 'string',
        required: false
    },
    host: {
        type: 'string',
        required: false     
    }, // regex
    port: {
        type: 'number',
        required: false
    },
    path: {
        type: 'string',
        required: false
    }
};

module.exports = function (schedule, tasks, options) {
    check('remote', options, fields);
    schedule.record('remote');
    tasks.push(remote(options));
}
