import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-request-id'] || uuidv4();
  req.id = correlationId as string;
  res.setHeader('X-Request-ID', correlationId);
  next();
};
