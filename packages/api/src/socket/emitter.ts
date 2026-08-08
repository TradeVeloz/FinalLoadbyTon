import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export function setIO(server: SocketIOServer): void {
  io = server;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastToJob(jobId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`job:${jobId}`).emit(event, payload);
  logger.info(`Socket broadcast ${event} to job:${jobId}`);
}

export function broadcastToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
  logger.info(`Socket broadcast ${event} to user:${userId}`);
}
