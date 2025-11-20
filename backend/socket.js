const socketIo = require('socket.io');

let io;

function init(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { init, getIo };
