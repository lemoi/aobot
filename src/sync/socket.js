const ws = {
    instance: {},
    id: 0,
    start: function (app) {
        const io = require('socket.io')(app);

        io.on('connection', function (socket) {
            var id = ws.id++;

            socket.on('disconnect', function () {
                delete ws.instance[id];
                process.stdout.write(`Disconnect to the browser${id}. \n`);
            });

            ws.instance[id] = socket;
            process.stdout.write(`Connect to the browser${id} successfully. \n`);
        });
    },

    emit: function (event, message) {
        for (let id in ws.instance) {
            ws.instance[id].emit(event, message);
        }
    },

    refresh: function () {
        ws.emit('refresh', '');
        process.stdout.write('Page refreshing. \n')
    }
}

module.exports = ws;