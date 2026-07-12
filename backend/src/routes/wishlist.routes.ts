import { Router } from 'express';
import {
  getWishlist,
  checkWishlistStatus,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  addToWishlistSchema,
  checkWishlistSchema,
  removeWishlistSchema,
  wishlistQuerySchema,
} from '../validators/wishlist.validator.js';

const router = Router();

// Secure all wishlist routes under JWT auth middleware
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Customer product bookmarking management
 */

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Retrieve user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated wishlist items
 *       401:
 *         description: Unauthorized
 */
router.get('/', validate(wishlistQuerySchema), getWishlist);

/**
 * @swagger
 * /api/v1/wishlist/check/{productId}:
 *   get:
 *     summary: Check if a product is wishlisted
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Returns boolean check
 *       401:
 *         description: Unauthorized
 */
router.get('/check/:productId', validate(checkWishlistSchema), checkWishlistStatus);

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *               productId: { type: string }
 *     responses:
 *       201:
 *         description: Product added, returns first page
 *       400:
 *         description: Wishlist limit cap exceeded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or is draft/archived
 */
router.post('/', validate(addToWishlistSchema), addToWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product removed, returns first page (idempotent)
 *       401:
 *         description: Unauthorized
 */
router.delete('/:productId', validate(removeWishlistSchema), removeFromWishlist);

/**
 * @swagger
 * /api/v1/wishlist:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 *       401:
 *         description: Unauthorized
 */
router.delete('/', clearWishlist);

export default router;
