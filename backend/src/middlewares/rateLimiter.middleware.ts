import { Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Generic browser/API rate limiter applied to all routes except the
 * Razorpay webhook endpoint.
 *
 * THRESHOLD RATIONALE:
 * A typical authenticated SPA session fires 4–8 API calls per page
 * transition (products, cart, wishlist, profile).  A 15-minute
 * browsing session involves roughly 15–25 navigations → ~60–200
 * requests per user.  500 req/15 min accommodates up to ~5–6
 * simultaneous legitimate users sharing one NAT IP while still
 * blocking volumetric scraping or automated abuse.
 *
 * WEBHOOK EXCLUSION:
 * POST /api/v1/payments/webhook/razorpay is excluded because:
 *   - Razorpay delivery volume is determined by payment activity,
 *     not by browser sessions, so a shared IP limit is wrong.
 *   - The real authenticity control is the HMAC SHA-256 signature
 *     check inside the handler; excluding the route from this
 *     limiter does NOT bypass that verification.
 *
 * DISTRIBUTED LIMITATION:
 * This limiter uses the default in-memory store, which is
 * process-local.  In a multi-instance deployment each process
 * maintains its own counter, so the effective per-IP limit scales
 * with instance count.  Redis-backed distributed limiting (via
 * rate-limit-redis) would close this gap but is deferred until
 * horizontal scaling is introduced.
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // 500 req/15 min per IP — tuned for SPA traffic profile
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  /**
   * Skip the Razorpay webhook route so payment delivery is never
   * rejected by the generic browser limiter.
   */
  skip: (req: Request) => req.path.replace(/\/$/, '') === '/api/v1/payments/webhook/razorpay',
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests, please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS));
  },
});
