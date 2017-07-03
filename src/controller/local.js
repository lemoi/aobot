const map = require('../service/map');
const check = require('../utils/check');
const fullpath = require('../utils/fullpath');
const local = require('../packer/local-packer');
const fields = {
    path: {
        type: 'string',
        required: true
    }
};

module.exports = function (schedule, tasks, options) {
    check('local', options, fields);
    schedule.wait('local');
    tasks.push(map(
        local(fullpath(options.path), () => schedule.notify('local'))
    ));
}
