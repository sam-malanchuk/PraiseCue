// minimal-socket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // adjust in production for security
  },
});

// Listen for connections and re-emit newDisplay events.
io.on('connection', socket => {
  console.log('A client connected:', socket.id);
  
  socket.on('newDisplay', data => {
    console.log('Received newDisplay event:', data);
    // Broadcast to all clients except the sender.
    socket.broadcast.emit('newDisplay', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Socket.io relay server listening on port 3001');
});
