import { Router } from 'express';
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  moveFromWishlist,
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  cartItemSchema,
  updateQuantitySchema,
  removeCartItemSchema,
  moveWishlistToCartSchema,
} from '../validators/cart.validator.js';

const router = Router();

// Secure all endpoints under JWT validation
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Customer shopping cart session management
 */

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Retrieve current cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current cart details with dynamically derived subtotals
 *       401:
 *         description: Unauthorized
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string, example: "65f8a0b0d3e5b3001f349a2a" }
 *               quantity: { type: integer, minimum: 1, maximum: 10, example: 2 }
 *     responses:
 *       200:
 *         description: Item added/incremented, returns updated CartDTO
 *       400:
 *         description: Stock verification limit or capacity limit exceeded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or is unpublished
 */
router.post('/items', validate(cartItemSchema), addItem);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1, maximum: 10, example: 5 }
 *     responses:
 *       200:
 *         description: Quantity updated, returns updated CartDTO
 *       400:
 *         description: Requested quantity exceeds available stock bounds
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Concurrency version conflict
 */
router.patch('/items/:productId', validate(updateQuantitySchema), updateQuantity);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed, returns updated CartDTO (idempotent)
 *       401:
 *         description: Unauthorized
 */
router.delete('/items/:productId', validate(removeCartItemSchema), removeItem);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared, returns empty CartDTO
 *       401:
 *         description: Unauthorized
 */
router.delete('/', clearCart);

/**
 * @swagger
 * /api/v1/cart/items/move-from-wishlist:
 *   post:
 *     summary: Move item from wishlist to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string, example: "65f8a0b0d3e5b3001f349a2a" }
 *     responses:
 *       200:
 *         description: Item moved to cart, returns updated CartDTO
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Transaction session rollback error
 */
router.post('/items/move-from-wishlist', validate(moveWishlistToCartSchema), moveFromWishlist);

export default router;
