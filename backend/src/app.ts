import express from 'express';
import { env } from './config/env.config';
import { connectDatabase } from './config/db.config';
import { initRedis } from './config/redis.config';
import { configureCloudinary } from './config/cloudinary.config';
import { HTTP_STATUS } from './constants';

const app = express();

console.log(`Initial boot configured for environment: ${env.NODE_ENV}`);
console.log(`Port settings: ${env.PORT}`);
console.log(`HTTP STATUS dictionary OK checks: ${HTTP_STATUS.OK}`);

// Simple initialization verify
configureCloudinary();
initRedis();
connectDatabase();

export default app;
