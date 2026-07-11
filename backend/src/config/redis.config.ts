import Redis from 'ioredis';
import { env } from './env.config.js';


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
    console.log('💚 Connected to Redis successfully.');
  });

  redis.on('error', (err) => {
    console.error(`❌ Redis connection error: ${err.message}`);
  });

  redis.on('close', () => {
    console.warn('⚠️ Redis connection closed.');
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
    console.log('💤 Redis connection closed successfully.');
  }
};
