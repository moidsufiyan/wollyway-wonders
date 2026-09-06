import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.config.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Normalizes and retrieves the allowlist of trusted frontend origins
 * from the existing env.CORS_ORIGIN configuration.
 * Trailing slashes are stripped to ensure consistent exact-string matching.
 */
export const getTrustedOrigins = (): string[] => {
  return env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

/**
 * Strict Origin validation middleware for cookie-authenticated endpoints
 * (/auth/refresh and /auth/logout) to prevent Cross-Site Request Forgery (CSRF).
 *
 * ── SECURITY MODEL ────────────────────────────────────────────────────────
 * 1. HttpOnly Cookie:
 *    Protects refresh tokens against direct JavaScript token theft (XSS defense).
 * 2. Origin Validation (This Middleware):
 *    Server-side boundary preventing unauthorized cross-site state-changing
 *    requests (CSRF defense) before any session invalidation or token rotation.
 * 3. CORS:
 *    Browser-enforced policy governing which origins may read cross-origin responses.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * VALIDATION RULES:
 * - Checks req.headers.origin first.
 * - If Origin is omitted, falls back to parsing the origin from req.headers.referer.
 * - Compares the candidate origin strictly (exact match, no substring or wildcard)
 *   against env.CORS_ORIGIN.
 * - Requests without an identifiable origin (missing both Origin and Referer)
 *   are rejected with 403 Forbidden to prevent CSRF bypass via origin-stripping.
 * - Rejection responses are generic and never leak session or token details.
 */
export const requireTrustedOrigin = (req: Request, _res: Response, next: NextFunction): void => {
  let candidateOrigin = req.headers.origin as string | undefined;

  // Fall back to Referer origin if Origin header is omitted
  if (!candidateOrigin && req.headers.referer) {
    try {
      candidateOrigin = new URL(req.headers.referer).origin;
    } catch {
      candidateOrigin = undefined;
    }
  }

  // Requests lacking an identifiable origin cannot be verified as originating
  // from a trusted frontend. Blindly trusting missing origins would create
  // an authentication/CSRF bypass via origin-suppressing techniques.
  if (!candidateOrigin) {
    return next(
      new AppError('Access forbidden: request origin could not be verified.', HTTP_STATUS.FORBIDDEN)
    );
  }

  const normalizedCandidate = candidateOrigin.trim().replace(/\/$/, '');
  const trustedOrigins = getTrustedOrigins();

  // Strict exact-match comparison against configured frontend origins
  if (!trustedOrigins.includes(normalizedCandidate)) {
    return next(new AppError('Access forbidden: untrusted request origin.', HTTP_STATUS.FORBIDDEN));
  }

  return next();
};
