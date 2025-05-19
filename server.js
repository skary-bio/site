const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = {};
let countdown = 0;
let gameRunning = false;

wss.on('connection', (ws) => {
  // 🎲 Создание нового игрока
  const playerId = Date.now().toString();
  ws.send(JSON.stringify({ type: 'init', playerId }));

  // 📡 Обработка сообщений
  ws.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'join') {
      players[playerId] = {
        id: playerId,
        nickname: msg.nickname,
        x: Math.random() * 800,
        y: Math.random() * 600,
        alive: true
      };
      if (Object.keys(players).length >= 3 && !gameRunning) {
        countdown = 10;
      }
    } else if (msg.type === 'move') {
      if (players[playerId]?.alive) {
        players[playerId].x = Math.max(0, Math.min(1000, players[playerId].x + msg.dx));
        players[playerId].y = Math.max(0, Math.min(1000, players[playerId].y + msg.dy));
      }
    } else if (msg.type === 'kill') {
      if (players[msg.targetId]) {
        players[msg.targetId].alive = false;
      }
    }

    // 📢 Отправка обновлений всем
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ type: 'update', players, countdown }));
    });
  });

  // 🚪 Отключение игрока
  ws.on('close', () => {
    delete players[playerId];
    if (Object.keys(players).length < 3 && countdown > 0) {
      countdown = 0;
    }
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ type: 'update', players, countdown }));
    });
  });
});

// ⏱️ Таймер обратного отсчета
setInterval(() => {
  if (countdown > 0) {
    countdown--;
    if (countdown === 0) {
      gameRunning = true;
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: 'start' }));
      });
    }
  }
  wss.clients.forEach(client => {
    client.send(JSON.stringify({ type: 'update', players, countdown }));
  });
}, 1000);

console.log('Сервер запущен на ws://localhost:8080 🚀');
