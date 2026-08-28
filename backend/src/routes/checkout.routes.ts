import { Router } from 'express';
import {
  startCheckout,
  getCurrentCheckout,
  extendCheckout,
  confirmCheckout,
  cancelCheckout,
  getCheckoutStatus,
} from '../controllers/checkout.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { confirmCheckoutSchema } from '../validators/checkout.validator.js';

const router = Router();

// Secure all endpoints under JWT auth
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Customer payment/reservation orchestration controls
 */

/**
 * @swagger
 * /api/v1/checkout/start:
 *   post:
 *     summary: Initialize checkout session and reserve inventory
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Checkout session created, items reserved in Redis (15 mins TTL)
 *       409:
 *         description: Validation price/stock mismatch check fail
 */
router.post('/start', startCheckout);

/**
 * @swagger
 * /api/v1/checkout/current:
 *   get:
 *     summary: Retrieve active checkout session details
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active checkout session summary
 *       404:
 *         description: No active checkout session found
 */
router.get('/current', getCurrentCheckout);

/**
 * @swagger
 * /api/v1/checkout/extend:
 *   post:
 *     summary: Extend stock reservation by 5 minutes
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation TTL extended
 *       400:
 *         description: Maximum extension limit reached (3 max)
 */
router.post('/extend', extendCheckout);

/**
 * @swagger
 * /api/v1/checkout/confirm:
 *   post:
 *     summary: Confirm checkout and start payment transaction
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentProvider]
 *             properties:
 *               paymentProvider: { type: string, enum: [stripe, razorpay, cod], example: "stripe" }
 *     responses:
 *       200:
 *         description: Checkout transitioned to PAYMENT_PENDING, returns payment gateway parameters
 *       409:
 *         description: Idempotency lockout check fail
 */
router.post('/confirm', validate(confirmCheckoutSchema), confirmCheckout);

/**
 * @swagger
 * /api/v1/checkout/cancel:
 *   post:
 *     summary: Cancel active checkout and release stock reserves immediately
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session marked CANCELLED and Redis stock locks purged
 */
router.post('/cancel', cancelCheckout);

/**
 * @swagger
 * /api/v1/checkout/{sessionId}/status:
 *   get:
 *     summary: Retrieve deterministic reconciliation status of a checkout session
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status of checkout. If COMPLETED, returns orderId and orderNumber.
 *       404:
 *         description: Checkout session not found or does not belong to user
 */
router.get('/:sessionId/status', getCheckoutStatus);

export default router;
