import { Request, Response, NextFunction } from 'express';
import { adminProductService } from '../services/admin-product.service.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Admin: Get a single product with full image data for the edit view.
 *
 * GET /api/v1/admin/products/:id
 */
export const getAdminProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await adminProductService.getProduct(req.params.id as string);
    res.status(HTTP_STATUS.OK).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all products across all visibility states.
 * Supports search, visibility filter, featured filter, pagination, and sorting.
 *
 * GET /api/v1/admin/products
 */
export const listAdminProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await adminProductService.listProducts(req.query);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};
