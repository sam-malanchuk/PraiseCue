const { Server } = require('socket.io');
let io;

module.exports = {
  initSocket: (server) => {
    io = new Server(server, { cors: { origin: '*' } });
    io.on('connection', socket => {
      console.log('▶️ Socket connected:', socket.id);
      socket.on('disconnect', () => console.log('❌ Socket disconnected:', socket.id));
    });
  },
  getIO: () => io,
};
