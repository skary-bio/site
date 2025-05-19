const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const loginDiv = document.getElementById('login');
const nicknameInput = document.getElementById('nickname');
const colorInput = document.getElementById('color');
const startBtn = document.getElementById('startBtn');

const socket = io();
let myId = null;
let keys = { up: false, down: false, left: false, right: false };
let players = {};

startBtn.onclick = () => {
  const nickname = nicknameInput.value.trim();
  const color = colorInput.value;
  if (!nickname) return alert('Введите ник!');
  loginDiv.style.display = 'none';
  socket.emit('newPlayer', { nickname, color });
};

socket.on('state', (serverPlayers) => {
  players = serverPlayers;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'w') keys.up = true;
  if (e.key === 's') keys.down = true;
  if (e.key === 'a') keys.left = true;
  if (e.key === 'd') keys.right = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'w') keys.up = false;
  if (e.key === 's') keys.down = false;
  if (e.key === 'a') keys.left = false;
  if (e.key === 'd') keys.right = false;
});

function gameLoop() {
  // Отправляем направление движения
  socket.emit('move', keys);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in players) {
    const p = players[id];
    // Квадрат
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 30, 30);
    // Ник
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText(p.nickname, p.x, p.y - 5);
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();
