import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionOptions = {
      maxPoolSize: env.NODE_ENV === 'production' ? 50 : 10,
      autoIndex: true,
    };

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(env.MONGO_URI, connectionOptions);
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to establish initial MongoDB connection');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error({ err: error }, 'Error during MongoDB disconnection');
  }
};
