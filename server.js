const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let players = {};
let countdown = 0;
let gameRunning = false;

io.on('connection', (socket) => {
  // 🎲 Создание нового игрока
  const playerId = socket.id;
  socket.emit('init', { playerId });

  // 📡 Обработка событий
  socket.on('join', (data) => {
    players[playerId] = {
      id: playerId,
      nickname: data.nickname,
      x: Math.random() * 800,
      y: Math.random() * 600,
      alive: true
    };
    if (Object.keys(players).length >= 3 && !gameRunning) {
      countdown = 10;
    }
    io.emit('update', { players, countdown });
  });

  socket.on('move', (data) => {
    if (players[playerId]?.alive) {
      players[playerId].x = Math.max(0, Math.min(1000, players[playerId].x + data.dx));
      players[playerId].y = Math.max(0, Math.min(1000, players[playerId].y + data.dy));
    }
    io.emit('update', { players, countdown });
  });

  socket.on('kill', (data) => {
    if (players[data.targetId]) {
      players[data.targetId].alive = false;
      const alivePlayers = Object.values(players).filter(p => p.alive).length;
      if (alivePlayers <= 1) {
        gameRunning = false;
        countdown = 0;
        for (const id in players) {
          players[id].alive = true;
          players[id].x = Math.random() * 800;
          players[id].y = Math.random() * 600;
        }
      }
    }
    io.emit('update', { players, countdown });
  });

  socket.on('disconnect', () => {
    delete players[playerId];
    if (Object.keys(players).length < 3 && countdown > 0) {
      countdown = 0;
    }
    io.emit('update', { players, countdown });
  });
});

// ⏱️ Таймер обратного отсчета
setInterval(() => {
  if (countdown > 0) {
    countdown--;
    if (countdown === 0 && !gameRunning) {
      gameRunning = true;
      io.emit('start');
    }
  }
  io.emit('update', { players, countdown });
}, 1000);

server.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000 🚀');
});
