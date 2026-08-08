import express from 'express';
import http from 'http';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/validation';
import { apiLimiter } from './middleware/rateLimit';
import { setupSocketIO } from './socket';
import { setIO } from './socket/emitter';

import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import bidsRoutes from './routes/bids';
import messagesRoutes from './routes/messages';
import documentsRoutes from './routes/documents';
import paymentsRoutes from './routes/payments';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import trackingRoutes from './routes/tracking';
import ratingsRoutes from './routes/ratings';
import webhooksRoutes from './routes/webhooks';

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('.onrender.com');
  } catch {
    return false;
  }
}

export function createServer() {
  const app = express();
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setupSocketIO(io);
  setIO(io);

  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(corsMiddleware);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'loadbyton-api', timestamp: new Date().toISOString() });
  });

  // API v1 Routes
  app.use('/api/v1/auth', apiLimiter, authRoutes);
  app.use('/api/v1/jobs', apiLimiter, jobsRoutes);
  app.use('/api/v1/bids', apiLimiter, bidsRoutes);
  app.use('/api/v1/messages', apiLimiter, messagesRoutes);
  app.use('/api/v1/documents', apiLimiter, documentsRoutes);
  app.use('/api/v1/payments', apiLimiter, paymentsRoutes);
  app.use('/api/v1/users', apiLimiter, usersRoutes);
  app.use('/api/v1/analytics', apiLimiter, analyticsRoutes);
  app.use('/api/v1/tracking', apiLimiter, trackingRoutes);
  app.use('/api/v1/ratings', apiLimiter, ratingsRoutes);
  app.use('/api/v1/webhooks', webhooksRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, server, io };
}
