import { Router } from 'express';
import {
  getFeaturedProducts,
  getProductBySlug,
  discoverProducts,
} from '../controllers/product.controller.js';
import { optionalProtect } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management and discovery
 */

/**
 * @swagger
 * /api/v1/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of published, featured products
 */
router.get('/featured', getFeaturedProducts);

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     summary: Get a single product by slug (Product Detail Page)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full product document
 *       404:
 *         description: Product not found
 */
router.get('/:slug', optionalProtect, getProductBySlug);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Discover products (search, filter, sort, paginate)
 *     description: |
 *       Unified product discovery endpoint. Supports full-text search, faceted
 *       filtering, multiple sort strategies, and offset pagination.
 *
 *       **Example:**
 *       `GET /api/v1/products?q=wool&categorySlug=winter&page=1&limit=12`
 *
 *       **Sort values:** `relevance` | `newest` | `price_asc` | `price_desc` | `name_asc` | `name_desc` | `featured`
 *
 *       **Defaults:** page=1, limit=12, sort=newest, availability=in_stock
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 100 }
 *         description: Full-text keyword search (name, tags, materials, description)
 *       - in: query
 *         name: categorySlug
 *         schema: { type: string }
 *         description: Filter by category slug (e.g. "winter-accessories")
 *       - in: query
 *         name: minPrice
 *         schema: { type: number, minimum: 0 }
 *         description: Minimum price filter (in cents)
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number, minimum: 0 }
 *         description: Maximum price filter (in cents). Must be >= minPrice.
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated tags (max 10). Normalized to lowercase.
 *       - in: query
 *         name: materials
 *         schema: { type: string }
 *         description: Comma-separated materials (e.g. "wool,cotton"). Normalized to lowercase.
 *       - in: query
 *         name: availability
 *         schema: { type: string, enum: [in_stock, all] }
 *         description: Filter by availability. Defaults to "in_stock".
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *         description: Filter to featured products only.
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [relevance, newest, price_asc, price_desc, name_asc, name_desc, featured] }
 *         description: Sort strategy. Defaults to "newest". "relevance" requires q.
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: Page number. Defaults to 1.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50 }
 *         description: Items per page. Defaults to 12. Maximum 50.
 *     responses:
 *       200:
 *         description: Paginated discovery results with Product Card DTOs
 *       400:
 *         description: Invalid query parameters (e.g. minPrice > maxPrice, limit > 50)
 */
router.get('/', optionalProtect, discoverProducts);

export default router;
