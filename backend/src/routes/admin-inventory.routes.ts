import { Router } from 'express';
import {
  listAdminInventory,
  getAdminInventoryByProductId,
  adjustInventory,
  getInventoryHistory,
} from '../controllers/admin-inventory.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  listAdminInventoryQuerySchema,
  inventoryAdjustmentSchema,
  inventoryHistoryQuerySchema,
} from '../validators/admin-inventory.validator.js';
import { mongoProductIdParamSchema } from '../validators/common.validator.js';

const router = Router();

// Secure all admin inventory routes under authentication + admin role
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @openapi
 * /api/v1/admin/inventory:
 *   get:
 *     summary: List all inventory records (Admin inventory overview)
 *     description: |
 *       Returns paginated inventory records across all products.
 *       Supports product search (by name, slug, or identifier), stock status filtering
 *       (in_stock, low_stock, out_of_stock, not_tracked), low-stock filtering,
 *       and deterministic sorting.
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 100 }
 *         description: Search query matching product name, slug, or ID
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, in_stock, low_stock, out_of_stock, not_tracked] }
 *         description: Filter by stock status. Defaults to 'all'.
 *       - in: query
 *         name: lowStock
 *         schema: { type: boolean }
 *         description: Filter to low-stock items only.
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [updated_desc, updated_asc, available_desc, available_asc, reserved_desc, reserved_asc, sold_desc, sold_asc] }
 *         description: Sort strategy. Defaults to 'updated_desc'.
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: Page number. Defaults to 1.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50 }
 *         description: Items per page. Defaults to 20. Maximum 50.
 *     responses:
 *       200:
 *         description: Paginated admin inventory list
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized (missing or expired token)
 *       403:
 *         description: Forbidden (admin role required)
 */
router.get('/', validate(listAdminInventoryQuerySchema), listAdminInventory);

/**
 * @openapi
 * /api/v1/admin/inventory/{productId}:
 *   get:
 *     summary: Retrieve exact product inventory details (Admin only)
 *     description: Returns exact inventory document and settings for a given product ID.
 *     tags: [Admin Inventory]
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
 *         description: Product inventory details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin role required)
 *       404:
 *         description: Inventory record not found
 */
router.get('/:productId', validate(mongoProductIdParamSchema), getAdminInventoryByProductId);

/**
 * @openapi
 * /api/v1/admin/inventory/{productId}/adjust:
 *   post:
 *     summary: Adjust inventory manually (Admin only)
 *     description: Atomically adjustments stock and creates an append-only ledger transaction.
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [change, reason]
 *             properties:
 *               change:
 *                 type: integer
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Adjusted successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       409:
 *         description: Conflicting reservations
 */
router.post('/:productId/adjust', validate(inventoryAdjustmentSchema), adjustInventory);

/**
 * @openapi
 * /api/v1/admin/inventory/{productId}/history:
 *   get:
 *     summary: Get inventory transaction history (Admin only)
 *     description: Returns paginated inventory transactions for a product.
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated transaction history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:productId/history', validate(inventoryHistoryQuerySchema), getInventoryHistory);

export default router;
