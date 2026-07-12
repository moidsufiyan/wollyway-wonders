import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, COOKIE_KEYS, REDIS_KEYS } from '../constants/index.js';
import { getRedisClient } from '../config/redis.config.js';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';

import { env } from '../config/env.config.js';

// Helper to set HTTP-Only cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // 1. Pre-flight application-level validation checking
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT));
    }

    // 2. Database level index will capture race conditions automatically
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
      status: 'active',
      preferences: {
        newsletter: false,
        marketingEmails: false,
        language: 'en',
        currency: 'INR',
      },
    });

    // 3. Issue JWT Access and Refresh Tokens
    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());

    // 4. Save SHA-256 hashed refresh token in Redis
    const hashedRT = hashToken(refreshToken);
    const redis = getRedisClient();
    try {
      await redis.setex(
        REDIS_KEYS.ACTIVE_REFRESH_TOKEN(user._id.toString()),
        7 * 24 * 60 * 60,
        hashedRT
      );
    } catch (redisError) {
      // Graceful fallback to log Redis errors without breaking client flow
      req.log?.error(redisError, 'Failed to store refresh token in Redis');
    }

    // 5. Write Refresh Token in Secure HTTP-Only Cookie
    res.cookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, getCookieOptions());

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Account registered successfully.',
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const redis = getRedisClient();
    const lockoutKey = `wollyway:auth:lockout:${normalizedEmail}`;
    const attemptsKey = `wollyway:auth:attempts:${normalizedEmail}`;

    // 1. Check if the user is currently locked out
    try {
      const isLocked = await redis.get(lockoutKey);
      if (isLocked) {
        return next(
          new AppError(
            'Too many failed login attempts. Please try again after 15 minutes.',
            HTTP_STATUS.TOO_MANY_REQUESTS
          )
        );
      }
    } catch (redisError) {
      req.log?.error(redisError, 'Redis lockout check failure');
    }

    // 2. Query User (explicitly include password for verification)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 3. Status checks
    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended.', HTTP_STATUS.FORBIDDEN));
    }

    if (user.status === 'deactivated') {
      return next(new AppError('This user account is deactivated.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 4. Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      // Increment attempt count and trigger lockout if limit reached
      try {
        const attempts = await redis.incr(attemptsKey);
        if (attempts === 1) {
          await redis.expire(attemptsKey, 15 * 60); // 15 mins expiry
        }
        if (attempts >= 5) {
          await redis.setex(lockoutKey, 15 * 60, 'true');
          await redis.del(attemptsKey);
          return next(
            new AppError(
              'Too many failed login attempts. Account locked for 15 minutes.',
              HTTP_STATUS.TOO_MANY_REQUESTS
            )
          );
        }
      } catch (redisError) {
        req.log?.error(redisError, 'Failed to update failed login attempts');
      }

      return next(new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 5. Successful login: Clear attempts trackers
    try {
      await redis.del(attemptsKey);
      await redis.del(lockoutKey);
    } catch (redisError) {
      req.log?.error(redisError, 'Failed to clear login attempts trackers');
    }

    // 6. Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // 7. Issue Tokens
    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());

    // 8. Cache hashed refresh token in Redis
    const hashedRT = hashToken(refreshToken);
    try {
      await redis.setex(
        REDIS_KEYS.ACTIVE_REFRESH_TOKEN(user._id.toString()),
        7 * 24 * 60 * 60,
        hashedRT
      );
    } catch (redisError) {
      req.log?.error(redisError, 'Failed to cache refresh token in Redis');
    }

    // 9. Write Cookie
    res.cookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, getCookieOptions());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies[COOKIE_KEYS.REFRESH_TOKEN];

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const redis = getRedisClient();
        // Remove session tracker key in Redis
        await redis.del(REDIS_KEYS.ACTIVE_REFRESH_TOKEN(decoded.sub));
      } catch (tokenError) {
        // Suppress errors if token was invalid/expired, proceed to clear cookie
        req.log?.error(tokenError, 'Invalid refresh token presented during logout');
      }
    }

    // Clear client cookie with exactly matching options used when setting it
    res.clearCookie(COOKIE_KEYS.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies[COOKIE_KEYS.REFRESH_TOKEN];
    if (!refreshToken) {
      return next(new AppError('No refresh token provided.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 1. Verify Refresh Token structure and decay state
    let decoded: { sub: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return next(new AppError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED));
    }

    const redis = getRedisClient();
    const redisKey = REDIS_KEYS.ACTIVE_REFRESH_TOKEN(decoded.sub);
    const incomingHashedRT = hashToken(refreshToken);

    // 2. Retrieve the active hashed refresh token from Redis
    let cachedHashedRT: string | null = null;
    try {
      cachedHashedRT = await redis.get(redisKey);
    } catch {
      return next(
        new AppError(
          'Session validation failed. Cache unavailable.',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }

    // 3. Detect token reuse (Breach Defense Logic)
    if (!cachedHashedRT || cachedHashedRT !== incomingHashedRT) {
      // Invalidate the entire token family session in case of theft detection
      try {
        await redis.del(redisKey);
      } catch (redisError) {
        req.log?.error(redisError, 'Failed to clear token family on reuse detection');
      }

      res.clearCookie(COOKIE_KEYS.REFRESH_TOKEN, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      });

      return next(
        new AppError('Security violation detected. All sessions revoked.', HTTP_STATUS.FORBIDDEN)
      );
    }

    // 4. Retrieve user checking active status bounds
    const user = await User.findById(decoded.sub);
    if (!user || user.status !== 'active') {
      return next(new AppError('User session is invalid or suspended.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 5. Rotate Refresh Token: Generate fresh token pairs
    const nextAccessToken = signAccessToken(user._id.toString(), user.role);
    const nextRefreshToken = signRefreshToken(user._id.toString());
    const nextHashedRT = hashToken(nextRefreshToken);

    // 6. Cache updated token hash in Redis
    try {
      await redis.setex(redisKey, 7 * 24 * 60 * 60, nextHashedRT);
    } catch (redisError) {
      req.log?.error(redisError, 'Failed to cache updated refresh token in Redis');
    }

    // 7. Write new rotated Cookie
    res.cookie(COOKIE_KEYS.REFRESH_TOKEN, nextRefreshToken, getCookieOptions());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      accessToken: nextAccessToken,
    });
  } catch (error) {
    next(error);
  }
};
