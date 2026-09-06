export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const COOKIE_KEYS = {
  REFRESH_TOKEN: 'wollyway_refresh',
} as const;

export const REDIS_KEYS = {
  ACTIVE_REFRESH_TOKEN: (userId: string) => `wollyway:auth:${userId}:rt`,
  CATALOG_CACHE: 'wollyway:catalog',
  INVENTORY_RESERVATION: (productId: string) => `wollyway:inventory:${productId}:reserve`,
  /**
   * Layer 1 — IP-wide brute-force counter.
   * Tracks total failed login attempts across ALL accounts from one IP.
   * Throttles sustained multi-account attacks from a single source.
   * TTL: 15 minutes.  Threshold: 15 failures.
   */
  LOGIN_IP_ATTEMPTS: (ip: string) => `wollyway:auth:ip:${ip}:attempts`,
  /**
   * Layer 2 — Per-IP + normalized-email counter / lockout.
   * Tracks failures from a specific IP against a specific account.
   * An attacker from IP A cannot lock the account for IP B.
   * TTL: 15 minutes.  Threshold: 5 failures (same as the old design).
   */
  LOGIN_IP_EMAIL_ATTEMPTS: (ip: string, email: string) =>
    `wollyway:auth:ip:${ip}:email:${email}:attempts`,
  LOGIN_IP_EMAIL_LOCKOUT: (ip: string, email: string) =>
    `wollyway:auth:ip:${ip}:email:${email}:lockout`,
} as const;

export const MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Something went wrong on the server',
} as const;

export const API = {
  PREFIX: '/api',
  VERSION: 'v1',
} as const;

export const MAX_FEATURED_CATEGORIES = 6;

export const RESERVATION_TIMEOUT_MINUTES = 15;

export const MAX_CART_ITEM_QUANTITY = 10;

export const ORDER_STATUS = {
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_CONSTANTS = {
  ORDER_NUMBER_PREFIX: 'WW',
  ORDER_NUMBER_MAX_RETRY: 3,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT_CUSTOMER: 50,
  MAX_LIMIT_ADMIN: 100,
} as const;

export const PAYMENT_WEBHOOK_STATUS = {
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  IGNORED: 'IGNORED',
} as const;

export type PaymentWebhookStatus =
  (typeof PAYMENT_WEBHOOK_STATUS)[keyof typeof PAYMENT_WEBHOOK_STATUS];
