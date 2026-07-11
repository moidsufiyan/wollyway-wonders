import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const mockAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Attempt to locate the primary mock test user
    let user = await User.findOne({ email: 'mock.tester@wollyway.com' });

    if (!user) {
      // Seed the database with a mock user if one does not exist
      user = await User.create({
        name: 'Mock Tester',
        email: 'mock.tester@wollyway.com',
        password: 'mockpassword123', // Dummy plain password (will be hashed when auth is implemented)
        role: 'customer',
        status: 'active',
        preferences: {
          newsletter: false,
          marketingEmails: false,
          language: 'en',
          currency: 'INR',
        },
      });
    }

    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended.', HTTP_STATUS.FORBIDDEN));
    }

    if (user.status === 'deactivated') {
      return next(new AppError('This user account is deactivated.', HTTP_STATUS.UNAUTHORIZED));
    }

    // Attach user profile context to Express request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
