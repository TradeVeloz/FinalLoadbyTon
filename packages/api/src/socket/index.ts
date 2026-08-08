import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/security';

export function setupSocketIO(io: SocketIOServer) {
  io.use((socket, next) => {
    // In development the demo client uses a mock token; still attach it if valid.
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token && process.env.NODE_ENV === 'production') {
      return next(new Error('Authentication required'));
    }
    try {
      if (token) {
        const decoded = verifyToken(token);
        socket.data.user = decoded;
      }
      next();
    } catch {
      if (process.env.NODE_ENV === 'production') {
        next(new Error('Invalid or expired token'));
      } else {
        next();
      }
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId: string | undefined = socket.data.user?.userId;
    logger.info(`Socket client connected: ${socket.id}${userId ? ` (user ${userId})` : ''}`);

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join:job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      logger.info(`Socket ${socket.id} joined room job:${jobId}`);
    });

    socket.on('leave:job', (jobId: string) => {
      socket.leave(`job:${jobId}`);
      logger.info(`Socket ${socket.id} left room job:${jobId}`);
    });

    socket.on('bid:submit', (data: { jobId: string; bid: unknown }) => {
      io.to(`job:${data.jobId}`).emit('bid:new', data.bid);
      logger.info(`Broadcast bid:new for job ${data.jobId}`);
    });

    socket.on('message:send', (data: { jobId: string; message: unknown }) => {
      io.to(`job:${data.jobId}`).emit('message:new', data.message);
      logger.info(`Broadcast message:new for job ${data.jobId}`);
    });

    socket.on('tracking:emit', (data: { jobId: string; location: { lat: number; lng: number; speed: number } }) => {
      io.to(`job:${data.jobId}`).emit('tracking:update', data.location);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });
}
