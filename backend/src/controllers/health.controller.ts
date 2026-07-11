import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import { env } from '../config/env.config.js';
import pkg from '../../package.json';

export const getHealth = (_req: Request, res: Response): void => {
  const uptime = process.uptime();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'API is healthy',
    data: {
      status: 'UP',
      uptime: `${uptime.toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: pkg.version,
    },
  });
};
