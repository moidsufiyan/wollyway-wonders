import { Router } from 'express';
import { adminCustomerController } from '../controllers/admin-customer.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all admin customer routes and restrict to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', adminCustomerController.getCustomers);
router.get('/:id', adminCustomerController.getCustomerById);
router.patch('/:id/status', adminCustomerController.updateCustomerStatus);

export const adminCustomerRoutes = router;
