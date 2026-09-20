import { Router } from 'express';
import { listAdminProducts, getAdminProduct } from '../controllers/admin-product.controller.js';
import {
  createProduct,
  updateProduct,
  archiveProduct,
  uploadProductImages,
  replaceProductImage,
  deleteProductImage,
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  upload,
  validateMagicNumbers,
  uploadRateLimiter,
} from '../middlewares/upload.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { mongoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

// Secure all admin product routes under authentication + admin role
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     summary: List all products (admin catalog view)
 *     description: |
 *       Returns products across all visibility states: draft, published, hidden, archived.
 *       Supports full-text search, visibility filter, featured filter, sorting, and pagination.
 *
 *       **Sort values:** `newest` | `oldest` | `price_asc` | `price_desc` | `name_asc` | `name_desc`
 *
 *       **Defaults:** page=1, limit=20, sort=newest, visibility=all
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 100 }
 *         description: Full-text search across name, tags, materials, shortDescription
 *       - in: query
 *         name: visibility
 *         schema: { type: string, enum: [all, draft, published, hidden, archived] }
 *         description: Filter by product visibility state. Defaults to 'all'.
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *         description: Filter to featured or non-featured products only.
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, price_asc, price_desc, name_asc, name_desc] }
 *         description: Sort strategy. Defaults to 'newest'.
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
 *         description: Paginated admin product list
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized (missing or expired token)
 *       403:
 *         description: Forbidden (admin role required)
 */
router.get('/', listAdminProducts);

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   get:
 *     summary: Get full product detail for admin edit view
 *     description: Returns the full product including all images with publicId, isPrimary, displayOrder.
 *     tags: [Admin Products]
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
 *         description: Full product detail
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin role required)
 *       404:
 *         description: Product not found
 */
router.get('/:id', validate(mongoIdParamSchema), getAdminProduct);

/**
 * @swagger
 * /api/v1/admin/products:
 *   post:
 *     summary: Create a new product draft
 *     tags: [Admin Products]
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
 * /api/v1/admin/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Admin Products]
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
router.patch('/:id', validate(mongoIdParamSchema), validate(updateProductSchema), updateProduct);

/**
 * @swagger
 * /api/v1/admin/products/{id}:
 *   delete:
 *     summary: Archive a product
 *     tags: [Admin Products]
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
router.delete('/:id', validate(mongoIdParamSchema), archiveProduct);

/**
 * @swagger
 * /api/v1/admin/products/{id}/images:
 *   post:
 *     summary: Upload product images
 *     tags: [Admin Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post(
  '/:id/images',
  uploadRateLimiter,
  validate(mongoIdParamSchema),
  upload.array('images', 10),
  validateMagicNumbers,
  uploadProductImages
);

/**
 * @swagger
 * /api/v1/admin/products/{id}/images/{publicId}:
 *   put:
 *     summary: Replace a product image
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image replaced successfully
 */
router.put(
  '/:id/images/:publicId(*)',
  uploadRateLimiter,
  validate(mongoIdParamSchema),
  upload.single('image'),
  validateMagicNumbers,
  replaceProductImage
);

/**
 * @swagger
 * /api/v1/admin/products/{id}/images/{publicId}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete('/:id/images/:publicId(*)', validate(mongoIdParamSchema), deleteProductImage);

export default router;
