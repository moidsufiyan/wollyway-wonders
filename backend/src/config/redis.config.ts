import Redis from 'ioredis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;

export const initRedis = (): Redis => {
  if (redis) {
    return redis;
  }

  redis = new Redis(env.REDIS_URI, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redis;
};

export const getRedisClient = (): Redis => {
  if (!redis) {
    return initRedis();
  }
  return redis;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed gracefully');
  }
};
