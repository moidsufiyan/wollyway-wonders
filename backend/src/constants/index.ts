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

export const COOKIES = {
  REFRESH_TOKEN: 'wollyway_refresh',
} as const;

export const MAX_FEATURED_CATEGORIES = 6;

export const RESERVATION_TIMEOUT_MINUTES = 15;
