import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.config.js';

export interface IJwtPayload extends jwt.JwtPayload {
  sub: string;
  role: 'customer' | 'admin';
}

export const signAccessToken = (userId: string, role: 'customer' | 'admin'): string => {
  const payload: IJwtPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
};

export const verifyRefreshToken = (token: string): { sub: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
