const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

const players = {};

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  socket.emit('init', socket.id);

  socket.on('newPlayer', (nickname) => {
    players[socket.id] = {
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 400,
      nickname: nickname,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    };
    io.emit('state', players);
  });

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

const players = {};

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  socket.emit('init', socket.id);

  socket.on('newPlayer', (nickname) => {
    players[socket.id] = {
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 400,
      nickname: nickname,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    };
    io.emit('state', players);
  });

  socket.on('move', (dir) => {
    const speed = 5;
    const p = players[socket.id];
    if (!p) return;

    if (dir.up) p.y -= speed;
    if (dir.down) p.y += speed;
    if (dir.left) p.x -= speed;
    if (dir.right) p.x += speed;

    io.emit('state', players);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('state', players);
  });
});

http.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
