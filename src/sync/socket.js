const log = require('../utils/log');
const ws = {
    instance: {},
    id: 0,
    start: function (app) {
        const io = require('socket.io')(app);

        io.on('connection', function (socket) {
            var id = ws.id++;

            socket.on('disconnect', function () {
                delete ws.instance[id];
                log.warn(`socket: disconnect to the browser${id}.`);
            });

            ws.instance[id] = socket;
            log.success(`socket: connect to the browser${id} successfully.`);
        });
    },

    emit: function (event, message) {
        for (let id in ws.instance) {
            ws.instance[id].emit(event, message);
        }
    },

    refresh: function () {
        ws.emit('refresh', '');
        log.info('socket: refreshing.')
    }
}

let i = 0;

module.exports = ws;