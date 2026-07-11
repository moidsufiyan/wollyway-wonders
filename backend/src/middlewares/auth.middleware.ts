import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { verifyAccessToken } from '../utils/token.js';

// Protect middleware to authenticate requests
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | null = null;

    // 1. Check for token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to gain access.',
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    // 2. Verify access token signature
    let decoded: ReturnType<typeof verifyAccessToken>;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'TokenExpiredError') {
        return next(
          new AppError(
            'Your session has expired. Please refresh your token.',
            HTTP_STATUS.UNAUTHORIZED
          )
        );
      }
      return next(new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 3. Retrieve user and verify existence
    const user = await User.findById(decoded.sub);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // 4. Validate account status active
    if (user.status !== 'active') {
      return next(
        new AppError(
          `Access denied. Your account is currently ${user.status}.`,
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    // 5. Check if password was changed after token issuance
    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (changedTimestamp > decoded.iat) {
        return next(
          new AppError(
            'User recently changed password. Please log in again.',
            HTTP_STATUS.UNAUTHORIZED
          )
        );
      }
    }

    // 6. Attach authenticated user context to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorization Role-Based Access Control middleware
export const restrictTo = (...roles: ('customer' | 'admin')[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication context missing.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};
