const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.broadcast.emit('chat message', 'user connection...');
    socket.on('chat message', function(msg){
        io.emit('chat massage', msg);
    });
    socket.on('disconnection', function(){
        socket.broadcast.emit('chat message', 'user disconnection...');
    })
});

http.listen(3000, function(){
    console.log('listening on*: 3000');
});