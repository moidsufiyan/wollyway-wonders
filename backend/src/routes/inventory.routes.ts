import { Router } from 'express';
import {
  getInventoryByProductId,
  getAdminInventoryByProductId,
  adjustInventory,
  updateSettings,
  reserveInventory,
  releaseInventory,
} from '../controllers/inventory.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  adjustInventorySchema,
  updateInventorySettingsSchema,
} from '../validators/inventory.validator.js';

const router = Router();

/**
 * @openapi
 * /api/v1/inventory/{productId}:
 *   get:
 *     summary: Retrieve public inventory availability status
 *     description: Returns availability descriptor mask (e.g. In Stock, Out of Stock, Only N left) for a product display page.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Masked stock state details.
 */
router.get('/:productId', getInventoryByProductId);

/**
 * @openapi
 * /api/v1/inventory/admin/{productId}:
 *   get:
 *     summary: Retrieve exact product inventory levels (Admin only)
 *     description: Returns unmasked quantities (available, reserved, sold) for store administrators.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exact stock details.
 */
router.get('/admin/:productId', protect, restrictTo('admin'), getAdminInventoryByProductId);

/**
 * @openapi
 * /api/v1/inventory/adjust:
 *   post:
 *     summary: Adjust product stock (Admin only)
 *     description: Changes stock levels manually, writing a new transaction audit trail.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - change
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *               change:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully.
 */
router.post(
  '/adjust',
  protect,
  restrictTo('admin'),
  validate(adjustInventorySchema),
  adjustInventory
);

/**
 * @openapi
 * /api/v1/inventory/{productId}/settings:
 *   patch:
 *     summary: Update inventory settings (Admin only)
 *     description: Configures threshold alerts and tracking properties.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settings updated.
 */
router.patch(
  '/:productId/settings',
  protect,
  restrictTo('admin'),
  validate(updateInventorySettingsSchema),
  updateSettings
);

/**
 * @openapi
 * /api/v1/inventory/reserve:
 *   post:
 *     summary: Reserve product stock (Checkout placeholder stub)
 *     description: Reserves stock during checkout flows.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lock verified placeholder success.
 */
router.post('/reserve', protect, reserveInventory);

/**
 * @openapi
 * /api/v1/inventory/release:
 *   post:
 *     summary: Release product stock (Checkout placeholder stub)
 *     description: Releases locked checkout stock.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Release validated placeholder success.
 */
router.post('/release', protect, releaseInventory);

export default router;
