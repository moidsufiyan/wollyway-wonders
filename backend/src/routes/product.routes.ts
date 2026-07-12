import { Router } from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  searchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
} from '../controllers/product.controller.js';
import { protect, restrictTo, optionalProtect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
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
 * /api/v1/products/search:
 *   get:
 *     summary: Search products using text index
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     summary: Get a product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found or archived
 */
router.get('/:slug', optionalProtect, getProductBySlug);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products (paginated/filtered)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get('/', optionalProtect, getAllProducts);

// --- Admin Routes ---
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product draft
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Created draft
 */
router.post('/', validate(createProductSchema), createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Updated product
 */
router.patch('/:id', validate(updateProductSchema), updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Archive a product
 *     tags: [Products]
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
 *         description: Product archived
 */
router.delete('/:id', archiveProduct);

export default router;
