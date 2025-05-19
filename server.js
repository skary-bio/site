const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Обслуживаем статические файлы из папки public
app.use(express.static('public'));

// Массив для хранения истории рисования
let drawHistory = [];
// Объект для хранения пользователей (ник + цвет)
let users = {};

io.on('connection', (socket) => {
    console.log('Пользователь подключился');

    // Отправляем новому пользователю историю рисования
    socket.emit('loadHistory', drawHistory);

    // Принимаем ник от пользователя и генерируем цвет
    socket.on('setNickname', (nickname) => {
        socket.nickname = nickname;
        // Генерируем случайный цвет
        socket.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        users[socket.id] = { nickname: socket.nickname, color: socket.color };
        console.log(`Пользователь ${nickname} установил ник, цвет: ${socket.color}`);

        // Отправляем обновлённый список пользователей всем
        io.emit('updateUsers', users);
    });

    socket.on('draw', (data) => {
        // Добавляем ник и цвет пользователя к данным рисования
        const drawData = {
            ...data,
            nickname: socket.nickname || 'Аноним',
            color: socket.color || '#000000' // Чёрный по умолчанию
        };

        // Сохраняем в историю
        drawHistory.push(drawData);

        // Рассылаем всем, включая отправителя
        io.emit('draw', drawData);
    });

    socket.on('disconnect', () => {
        console.log(`Пользователь ${socket.nickname || 'неизвестный'} отключился`);
        // Удаляем пользователя из списка
        delete users[socket.id];
        // Обновляем список пользователей для всех
        io.emit('updateUsers', users);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
