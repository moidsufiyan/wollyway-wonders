import { Router } from 'express';
import {
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAdminOrders,
  getAdminOrderById,
  adminUpdateOrderStatus,
  adminCancelOrder,
} from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  customerOrderQuerySchema,
  customerCancelOrderSchema,
  adminOrderQuerySchema,
  adminUpdateOrderStatusSchema,
  adminCancelOrderSchema,
} from '../validators/order.validator.js';

const router = Router();

// Secure all order endpoints under authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Permanent sales order management and fulfillment lifecycle
 */

// --------------------------------------------------------------------------
// Customer Order Endpoints
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/orders/me:
 *   get:
 *     summary: Retrieve paginated order history for the authenticated customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Paginated list of customer order summaries
 *       401:
 *         description: Unauthorized access
 */
router.get('/me', validate(customerOrderQuerySchema), getMyOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Retrieve itemized receipt for a specific order (IDOR protected)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Order ObjectId or public Order Number (e.g. WW-20260819-7F3A)
 *     responses:
 *       200:
 *         description: Detailed order receipt
 *       404:
 *         description: Order not found or unauthorized to view
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: Customer cancellation of an active order (CONFIRMED/PROCESSING)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Order ObjectId or public Order Number
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Order cancelled and inventory restocked
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order cannot be cancelled in its current state
 */
router.post('/:id/cancel', validate(customerCancelOrderSchema), cancelMyOrder);

// --------------------------------------------------------------------------
// Administrative Order Management Endpoints
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/orders/admin:
 *   get:
 *     summary: Administrator search and review of all store orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated admin order list with customer details
 *       403:
 *         description: Admin privileges required
 */
router.get('/admin', restrictTo('admin'), validate(adminOrderQuerySchema), getAdminOrders);

/**
 * @swagger
 * /api/v1/orders/admin/{id}:
 *   get:
 *     summary: Administrator order detail inspection by ID or Order Number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comprehensive admin order detail with transaction IDs
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 */
router.get('/admin/:id', restrictTo('admin'), getAdminOrderById);

/**
 * @swagger
 * /api/v1/orders/admin/{id}/status:
 *   patch:
 *     summary: Administrator update of fulfillment state and tracking details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PROCESSING, SHIPPED, DELIVERED]
 *               carrier:
 *                 type: string
 *                 maxLength: 50
 *               trackingNumber:
 *                 type: string
 *                 maxLength: 100
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid state transition
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 */
router.patch(
  '/admin/:id/status',
  restrictTo('admin'),
  validate(adminUpdateOrderStatusSchema),
  adminUpdateOrderStatus
);

/**
 * @swagger
 * /api/v1/orders/admin/{id}/cancel:
 *   post:
 *     summary: Administrator forced order cancellation and inventory restocking
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Order cancelled and restocked by administrator
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order cannot be cancelled in its current state
 */
router.post(
  '/admin/:id/cancel',
  restrictTo('admin'),
  validate(adminCancelOrderSchema),
  adminCancelOrder
);

export default router;
