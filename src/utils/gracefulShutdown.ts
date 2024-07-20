import type { Server } from 'http';
import { db } from '../db.js';

export const gracefulShutdown = (server: Server) => {
  return async () => {
    await db.destroy();

    server.close(() => {
      console.log('Auth Only Server closed');

      process.exit(0);
    });
  };
};
