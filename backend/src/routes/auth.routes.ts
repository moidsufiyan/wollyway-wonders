import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new customer
 *     description: Creates a user account with strict password validation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully.
 *       409:
 *         description: Email already in use.
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user login
 *     description: Verifies credentials, manages failed attempt limits, and issues session tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid email or password.
 *       429:
 *         description: Lockout triggered due to excessive failures.
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout session
 *     description: Destroys token cache track in Redis and clears HTTP-Only cookies.
 *     responses:
 *       200:
 *         description: Logged out successfully.
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Rotate refresh tokens
 *     description: Evaluates refresh cookie state in Redis to rotate JWT access and refresh token pairs.
 *     responses:
 *       200:
 *         description: Token rotated successfully.
 *       401:
 *         description: Missing or expired token.
 *       403:
 *         description: Security breach / reuse detected.
 */
router.post('/refresh', refresh);

export default router;
