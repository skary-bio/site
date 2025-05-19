const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Обслуживаем статические файлы из папки public
app.use(express.static('public'));

// Массив для хранения истории рисования
let drawHistory = [];

io.on('connection', (socket) => {
    console.log('Пользователь подключился');

    // Отправляем новому пользователю историю рисования
    socket.emit('loadHistory', drawHistory);

    // Принимаем ник от пользователя
    socket.on('setNickname', (nickname) => {
        socket.nickname = nickname; // Сохраняем ник в объекте сокета
        console.log(`Пользователь ${nickname} установил ник`);
    });

    socket.on('draw', (data) => {
        // Добавляем ник пользователя к данным рисования
        const drawData = {
            ...data,
            nickname: socket.nickname || 'Аноним' // Если ник не указан, используем "Аноним"
        };

        // Сохраняем в историю
        drawHistory.push(drawData);

        // Рассылаем всем, включая отправителя
        io.emit('draw', drawData);
    });

    socket.on('disconnect', () => {
        console.log(`Пользователь ${socket.nickname || 'неизвестный'} отключился`);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
