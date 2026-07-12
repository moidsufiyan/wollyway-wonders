import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

// 1. Multer setup with Memory Storage & Hard Size limits (5MB)
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, and WEBP files are allowed', HTTP_STATUS.BAD_REQUEST));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter,
});

// 2. Deep Validation: Magic Numbers Check (File Signatures verification)
const isValidMagicNumber = (buffer: Buffer): boolean => {
  if (buffer.length < 4) return false;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // WEBP: RIFF (52 49 46 46) at start, WEBP (57 45 42 50) at offset 8
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
};

export const validateMagicNumbers = (req: Request, _res: Response, next: NextFunction): void => {
  const files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  } else if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      Object.values(req.files).forEach((fileArray) => {
        files.push(...fileArray);
      });
    }
  }

  for (const file of files) {
    if (!isValidMagicNumber(file.buffer)) {
      return next(
        new AppError(
          `Invalid file signature. File header validation failed for: ${file.originalname}`,
          HTTP_STATUS.BAD_REQUEST
        )
      );
    }
  }

  next();
};

// 3. Upload specific rate limiter (Admin restricted - 20 uploads per hour)
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20, // Limit each IP/account to 20 uploads per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        'Upload quota exceeded. Admins are limited to 20 uploads per hour.',
        HTTP_STATUS.TOO_MANY_REQUESTS
      )
    );
  },
});
