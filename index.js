const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('setNickname', (nick) => {
        socket.nickname = nick;
        io.emit('chat message', nick + ' 님이 접속하였습니다.');
    });

    socket.on('chat message', function (msg) {
        if (socket.nickname !== '') {
            socket.broadcast.emit('typing', '');
            io.emit('chat message', socket.nickname + ': ' + msg);
        }
    });

    socket.on('disconnect', function () {
        if (socket.nickname) {
            io.emit('chat message', socket.nickname + ' 님이 도망갔습니다...');
        }
    });

    socket.on('typing', function (msg) {
        if (socket.nickname && msg !== '') {
            socket.broadcast.emit('typing', msg + ' 님이 채팅을 입력중입니다...');
        }
    });
});




http.listen(3000, function () {
    console.log('listening on *:3000');
});
