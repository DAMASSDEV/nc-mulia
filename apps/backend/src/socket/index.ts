import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface AuthPayload {
  userId: string;
  role: 'admin' | 'user';
}

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.request.headers.cookie
      ?.split('; ')
      .find(c => c.startsWith('accessToken='))
      ?.split('=')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as AuthPayload;
    socket.join(`user:${user.userId}`);

    socket.on('chat:join', (conversationId: string) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on('chat:leave', (conversationId: string) => {
      socket.leave(`chat:${conversationId}`);
    });

    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.conversationId}`).emit('chat:typing', {
        conversationId: data.conversationId,
        userId: user.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export { io };
