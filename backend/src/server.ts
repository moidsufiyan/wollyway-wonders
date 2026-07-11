import app from './app.js';
import { env } from './config/env.config.js';
import { connectDatabase, disconnectDatabase } from './config/db.config.js';
import { initRedis, closeRedis } from './config/redis.config.js';
import { logger } from './utils/logger.js';
import { Server } from 'http';

let server: Server;

const bootstrap = async (): Promise<void> => {
  try {
    // Initialize database and Redis connections
    await connectDatabase();
    initRedis();

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Foundation Server successfully started on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, '❌ Failed to start the backend foundation server:');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`⚠️ Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');

      // Close database and Redis resource connections
      await disconnectDatabase();
      await closeRedis();

      logger.info('👋 Graceful shutdown complete. Exiting.');
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    await closeRedis();
    process.exit(0);
  }

  // Force termination fallback if cleanup hangs
  setTimeout(() => {
    logger.error('❌ Force exiting: cleanup connections timed out.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

// Boot the server
void bootstrap();
