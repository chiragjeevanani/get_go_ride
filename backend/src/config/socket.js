import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
        : process.env.FRONTEND_URL,
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room based on bidId (or chat room ID)
    socket.on('join_chat', ({ bidId }) => {
      if (bidId) {
        socket.join(bidId.toString());
        console.log(`👤 Client ${socket.id} joined chat room: ${bidId}`);
      }
    });

    // Leave room
    socket.on('leave_chat', ({ bidId }) => {
      if (bidId) {
        socket.leave(bidId.toString());
        console.log(`👤 Client ${socket.id} left chat room: ${bidId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    if (process.env.NODE_ENV === 'test') {
      return {
        to: () => ({
          emit: () => {}
        })
      };
    }
    throw new Error('Socket.io is not initialized! Call initSocket first.');
  }
  return io;
};
