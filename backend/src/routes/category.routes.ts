import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect, restrictTo, optionalProtect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     summary: Retrieve categories catalog list
 *     description: Retrieve all active categories (ordered by sortOrder). Supports filtering by featured status. Admins can see hidden categories.
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: string
 *         description: Set to 'true' to get featured categories only
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Admin only filter (active/hidden)
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully.
 */
router.get('/', optionalProtect, getCategories);

/**
 * @openapi
 * /api/v1/categories/{slug}:
 *   get:
 *     summary: Retrieve single category
 *     description: Retrieve category data by its URL slug.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details.
 *       404:
 *         description: Category not found.
 */
router.get('/:slug', getCategoryBySlug);

/**
 * @openapi
 * /api/v1/categories:
 *   post:
 *     summary: Create new category (Admin only)
 *     description: Creates a new catalog category. Checks featured capacity rules.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Validation or business rule violation.
 */
router.post('/', protect, restrictTo('admin'), validate(createCategorySchema), createCategory);

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update category properties (Admin only)
 *     description: Updates category fields dynamically.
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
 *         description: Category updated.
 */
router.patch('/:id', protect, restrictTo('admin'), validate(updateCategorySchema), updateCategory);

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Soft-delete category (Admin only)
 *     description: Archives a category. Fails if active products reference the category.
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
 *         description: Category archived.
 *       400:
 *         description: Cannot delete with linked active products.
 */
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

export default router;
