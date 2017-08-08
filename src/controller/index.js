const server = require('../server');
const check = require('../utils/check');
const log = require('../utils/log');
const browser = require('../sync/browser');

/*
    total: {
        key: num
    },
    done: {
        key: num
    }
*/
const schedule = {
    cache: [],
    delay: [],
    total: {},
    done: {},
    runningFlag: false,
    ssl: false,
    record: function (which) {
        this.set(this.total, which);
        this.set(this.done, which);
    },
    wait: function (which) {
        this.set(this.total, which);
    },
    notify: function (which) {
        this.set(this.done, which);
    },
    set: function (table, which) {
        if (table.hasOwnProperty(which)) {
            table[which]++;
        } else {
            table[which] = 1;
        }
    },
    trying: function (processing, done) {
        const waiting = {};
        for (var i in this.total) {
            if (!this.done.hasOwnProperty(i)) {
                waiting[i] = this.total[i];
            } else if (this.done[i] !== this.total[i]){
                waiting[i] = this.total[i] - this.done[i];
            }
        }
        if (Object.keys(waiting).length === 0) {
            done();
        } else {
            processing(waiting);
        }
    },
    runningTest: function () {
        if (this.runningFlag === true) {
            log.error('Sorry, aobot is running');
            throw Error('RunningError');
        }
    },
    enableSSL: function () {
        this.ssl = true;
    }
};

function getTotal(obj) {
    let num = 0;
    for (var i in obj) {
        num += obj[i];
    }
    return num;
}

function format(table) {
    const temp = [];
    for (var i in table) {
        temp.push(`${i}(${table[i]})`);
    }
    return temp.join(', ');
}

function prepare(times, done) {
    const delay = 500;

    function processing(waiting) {
        log.warn(`wait for: ${format(waiting)}`);
        if (times-- > 0) {
            setTimeout(() => schedule.trying(processing, done), delay);
        } else {
            log.error(`failed to load: ${format(waiting)}`);
            throw Error('ServiceLoadingError');
        }
    }

    log.info(`${getTotal(schedule.total)} services to load in total: ${format(schedule.total)}`);
    schedule.trying(processing, done);
}

function listen(port) {
    schedule.runningTest();
    schedule.runningFlag = true;
    log.info('Aobot is preparing to start ...');
    browser.init(port);
    prepare(10,
        () => {
            schedule.cache.forEach(({ options, tasks }) => {
                server.register(require('../service/route')(options, tasks));
            });
            server.run(schedule.ssl, port, () => {
                log.success('Aobot started successfully!');
            });
        }
    );
}

function factory(tasks) {

    const chain = {
        pipe: pipe,
        listen: listen        
    };

    function pipe(service, options) {
        try {
            service = require('./' + service);
        } catch (e) {
            log.error('Service ' + service + ' is not supported by aobot');
            throw Error('ServiceTypeError');
        }
        service(schedule, tasks, options);
        return chain;
    }

    return chain;
}

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

function route(options) {
    schedule.runningTest();
    check('route', options, fields);
    const tasks  = Array();
    schedule.cache.push({ options, tasks });

    return factory(tasks);
}

module.exports.route = route
module.exports.listen = listen;
module.exports.enableSSL = schedule.enableSSL.bind(schedule);
