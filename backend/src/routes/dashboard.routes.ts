import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

// Secure all dashboard routes under admin authorization
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Retrieve administrative dashboard analytics
 *     description: Returns aggregated product catalog metrics, order fulfillment breakdown, paid revenue, and the 5 most recent orders.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consolidated dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 48 }
 *                         published: { type: integer, example: 42 }
 *                         draft: { type: integer, example: 3 }
 *                         hidden: { type: integer, example: 2 }
 *                         archived: { type: integer, example: 1 }
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 45 }
 *                         confirmed: { type: integer, example: 5 }
 *                         processing: { type: integer, example: 8 }
 *                         shipped: { type: integer, example: 12 }
 *                         delivered: { type: integer, example: 18 }
 *                         cancelled: { type: integer, example: 2 }
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 245000 }
 *                         currency: { type: string, example: "INR" }
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           orderNumber: { type: string, example: "WW-20260907-XXXX" }
 *                           customer:
 *                             type: object
 *                             properties:
 *                               name: { type: string, example: "Jane Doe" }
 *                               email: { type: string, example: "jane@example.com" }
 *                           status: { type: string, example: "PROCESSING" }
 *                           orderTotal: { type: integer, example: 5500 }
 *                           currency: { type: string, example: "INR" }
 *                           itemCount: { type: integer, example: 2 }
 *                           createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized access (missing or invalid token)
 *       403:
 *         description: Admin privileges required
 */
router.get('/', getDashboard);

export default router;
