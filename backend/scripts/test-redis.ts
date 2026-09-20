import { env } from '../src/config/env.config.js';
import Redis from 'ioredis';

async function run() {
  const redis = new Redis(env.REDIS_URI, { maxRetriesPerRequest: 1 });
  redis.on('error', (e) => console.error('Error:', e.message));
  try {
    const res = await redis.ping();
    console.log('Ping:', res);
    process.exit(0);
  } catch (e) {
    console.error('Failed to ping:', e.message);
    process.exit(1);
  }
}
run();
