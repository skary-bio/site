const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Папка для статических файлов (например, index.html)

io.on('connection', (socket) => {
  let nickname = '';

  // Получение ника от клиента
  socket.on('setNickname', (nick) => {
    nickname = nick;
    socket.broadcast.emit('userConnected', nickname); // Уведомление других пользователей
  });

  // Получение и рассылка сообщений
  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data); // Рассылка сообщения всем клиентам
  });

  // Обработка отключения
  socket.on('disconnect', () => {
    if (nickname) {
      socket.broadcast.emit('userDisconnected', nickname);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
