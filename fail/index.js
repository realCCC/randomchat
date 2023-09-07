const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
const waitingUsers = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // 사용자 닉네임 설정
  socket.on('setNickname', (nick) => {
    socket.nickname = nick;
    io.emit('chat message', nick + ' 님이 접속하였습니다.');
    // 대기 중인 사용자와 매칭 시도
    tryMatchRandomUser(socket);
  });

  // 메시지 전송
  socket.on('chat message', function (msg) {
    if (socket.roomName) {
      io.to(socket.roomName).emit('chat message', socket.nickname + ': ' + msg);
    }
  });

  // 연결 종료 시 처리
  socket.on('disconnect', function () {
    if (socket.nickname) {
      io.emit('chat message', socket.nickname + ' 님이 도망갔습니다...');
      // 대기 중인 사용자 목록에서 제거
      const index = waitingUsers.indexOf(socket);
      if (index !== -1) {
        waitingUsers.splice(index, 1);
      }
    }
  });
});

// 랜덤 사용자 매칭 함수
function tryMatchRandomUser(socket) {
  if (waitingUsers.length > 0) {
    const randomIndex = Math.floor(Math.random() * waitingUsers.length);
    const randomUser = waitingUsers[randomIndex];

    // 두 사용자를 같은 방에 입장시킴 (예: 방 이름은 사용자의 고유 ID로 생성)
    const roomName = socket.id + '-' + randomUser.id;
    socket.join(roomName);
    randomUser.join(roomName);
    socket.roomName = roomName;
    randomUser.roomName = roomName;

    // 대화를 시작할 메시지 전송
    socket.emit('chat message', '랜덤 사용자와 매칭되었습니다. 대화를 시작하세요!');
    randomUser.emit('chat message', '랜덤 사용자와 매칭되었습니다. 대화를 시작하세요!');

    // 대기 중인 사용자 목록에서 제거
    const index = waitingUsers.indexOf(randomUser);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
  } else {
    // 대기 중인 사용자 목록에 추가
    waitingUsers.push(socket);
    socket.emit('chat message', '랜덤 사용자를 찾는 중입니다...');
  }
}

http.listen(port, () => {
  console.log('listening on *:' + port);
});
