const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const db = require('./db');

let ioInstance = null;

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '').replace(/^Bearer\s+/i, '');

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('join:user', (payload) => {
      const userId = typeof payload === 'object' ? payload?.userId : payload;
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    const handleJoinPlan = (payload) => {
      const planId = typeof payload === 'object' ? payload?.planId : payload;
      if (planId) {
        socket.join(`plan:${planId}`);
      }
    };

    const handleLeavePlan = (payload) => {
      const planId = typeof payload === 'object' ? payload?.planId : payload;
      if (planId) {
        socket.leave(`plan:${planId}`);
      }
    };

    socket.on('join:plan', handleJoinPlan);
    socket.on('join_plan_room', handleJoinPlan);

    socket.on('leave:plan', handleLeavePlan);
    socket.on('leave_plan_room', handleLeavePlan);

    socket.on('chat:send', async (payload, ack) => {
      try {
        const senderId = socket.user?.id || payload?.senderId;
        const { planId, content } = payload || {};
        if (!senderId || !planId || !content) {
          if (typeof ack === 'function') ack({ error: 'planId and content are required' });
          return;
        }
        const message = await db.createGroupMessage({
          planId,
          senderId,
          content,
          type: 'CHAT'
        });
        io.to(`plan:${planId}`).emit('chat:message', message);
        if (typeof ack === 'function') ack({ message });
      } catch (err) {
        if (typeof ack === 'function') ack({ error: err.message });
      }
    });
  });

  ioInstance = io;
  return io;
}

function emitToPlan(planId, event, data) {
  if (ioInstance && planId) {
    ioInstance.to(`plan:${planId}`).emit(event, data);
  }
}

function emitToUser(userId, event, data) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  emitToPlan,
  emitToUser
};
