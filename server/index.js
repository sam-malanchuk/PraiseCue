const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let currentSlide = null;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('update-slide', currentSlide);

  socket.on('set-slide', (data) => {
    currentSlide = data;
    io.emit('update-slide', currentSlide);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.send('FaithSlides backend running!'));

server.listen(3001, () => {
  console.log('Express + Socket.IO server listening on http://localhost:3001');
});
