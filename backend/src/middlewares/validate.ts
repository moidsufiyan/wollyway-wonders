import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Safely replace req fields with parsed/coerced versions only if they were parsed
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'),
          message: issue.message,
        }));
        next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, issues));
      } else {
        next(error);
      }
    }
  };
};
