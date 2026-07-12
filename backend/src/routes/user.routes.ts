import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema, addressSchema } from '../validators/user.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication guard to all User routes
router.use(protect);

/**
 * @openapi
 * /api/v1/users/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Returns the authenticated user's profile information.
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get('/profile', getProfile);

/**
 * @openapi
 * /api/v1/users/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Modifies user information such as name, phone, preferences, and avatar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Validation error.
 */
router.patch('/profile', validate(updateProfileSchema), updateProfile);

/**
 * @openapi
 * /api/v1/users/addresses:
 *   get:
 *     summary: Retrieve address book
 *     description: Returns all saved addresses for the authenticated user.
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully.
 */
router.get('/addresses', getAddresses);

/**
 * @openapi
 * /api/v1/users/addresses:
 *   post:
 *     summary: Add an address
 *     description: Adds a new address to the user's saved list (limit of 5).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - streetAddress
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *               - phone
 *             properties:
 *               label:
 *                 type: string
 *                 enum: [Home, Work, Office, Other]
 *               streetAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added successfully.
 *       400:
 *         description: Limit exceeded or validation failure.
 */
router.post('/addresses', validate(addressSchema), addAddress);

/**
 * @openapi
 * /api/v1/users/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     description: Modifies an existing saved address by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - streetAddress
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *               - phone
 *             properties:
 *               label:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully.
 *       404:
 *         description: Address not found.
 */
router.put('/addresses/:id', validate(addressSchema), updateAddress);

/**
 * @openapi
 * /api/v1/users/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     description: Removes a saved address by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully.
 *       404:
 *         description: Address not found.
 */
router.delete('/addresses/:id', deleteAddress);

export default router;
