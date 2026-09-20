import { Router } from 'express';
import {
  listOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
} from '../controllers/admin-order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  updateAdminOrderStatusSchema,
  cancelAdminOrderSchema,
  listAdminOrdersQuerySchema,
  orderIdParamSchema,
} from '../validators/admin-order.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: List all orders for admin
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin privileges required
 */
router.get('/', validate(listAdminOrdersQuerySchema), asyncHandler(listOrders));

/**
 * @swagger
 * /api/v1/admin/orders/{id}:
 *   get:
 *     summary: Get order details by ID for admin
 *     tags: [Admin Orders]
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
 *         description: Order details retrieved successfully
 *       400:
 *         description: Invalid Order ID format
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 */
router.get('/:id', validate(orderIdParamSchema), asyncHandler(getAdminOrderById));

/**
 * @swagger
 * /api/v1/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status for admin
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PROCESSING, SHIPPED, DELIVERED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Invalid state transition
 */
router.patch(
  '/:id/status',
  validate(updateAdminOrderStatusSchema),
  asyncHandler(updateAdminOrderStatus)
);

/**
 * @swagger
 * /api/v1/admin/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order, initiate refund if paid, and restock inventory
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *       400:
 *         description: Validation error or provider rejection
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Order not found
 *       409:
 *         description: State conflict
 *       503:
 *         description: Payment gateway response timed out or is uncertain
 */
router.post('/:id/cancel', validate(cancelAdminOrderSchema), asyncHandler(cancelAdminOrder));

export default router;
