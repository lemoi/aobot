const fis = require('../packer/fis-packer.js');
const map = require('../service/map');
const check = require('../utils/check');
const fullpath = require('../utils/fullpath');

const rootFields = {
    project: {
        type: 'string',
        required: false        
    },
    deploy: {
        type: 'string',
        required: true,
    },
    upload: {
        type: 'object',
        required: false
    }
};

const uploadFields = {
    filter: {
        type: 'string',
        required: false
    },
    ssh: {
         type: 'object',
         required: false       
    }
};

const sshFileds = {
    ip: {
        type: 'string',
        required: true
    },
    port: {
        type: 'number',
        required: false
    },
    user: {
        type: 'string',
        required: true        
    }
};

module.exports = function (schedule, tasks, options) {
    check('fis', options, rootFields);
    if (options.upload) {
        check('fis.upload', options.upload, uploadFields);
        if (options.upload.ssh) {
            check('fis.upload.ssh', options.upload.ssh, sshFileds);
        }
    }

    schedule.wait('fis');

    options.project = fullpath(options.project || '.');

    tasks.push(map(
        fis(options, () => schedule.notify('fis'))
    ));
}
