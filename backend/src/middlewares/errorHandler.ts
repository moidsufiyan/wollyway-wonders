import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.config.js';


export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errors: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details || [];
  } else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Duplicate field value entered';
  }

  // Log error using Pino with correlation ID context
  logger.error({
    msg: err.message,
    err,
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    requestId: req.id,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Cannot find route ${req.originalUrl} on this server`, HTTP_STATUS.NOT_FOUND));
};

