const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    socket.broadcast.emit('chat message', '님이 접속하였습니다...');

    socket.on('chat message', (msg) => {
        io.emit('chat massage', msg);
    });

    socket.on('disconnect', function () {
        socket.broadcast.emit('chat message', '님이 도망갔습니다...');
    })
});

http.listen(3000, function () {
    console.log('listening on*: 3000');
});