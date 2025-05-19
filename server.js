const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000;

app.use(express.static('public'));

const users = {};
const history = [];

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  socket.on('setNickname', (nickname) => {
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    users[socket.id] = { nickname, color: userColor };
    socket.emit('loadHistory', history);
    io.emit('updateUsers', users);
  });

  socket.on('draw', (data) => {
    const user = users[socket.id];
    if (!user) return;
    const drawData = { ...data, color: data.color || user.color };
    history.push(drawData);
    io.emit('draw', drawData);
  });

  socket.on('clear', () => {
    history.length = 0;
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('updateUsers', users);
    console.log('Отключился:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
