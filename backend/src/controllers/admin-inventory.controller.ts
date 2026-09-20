import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { inventoryAdjustmentSchema } from '../validators/admin-inventory.validator.js';

/**
 * GET /api/v1/admin/inventory
 * Lists inventory items with pagination, search, status filtering, and sorting.
 */
export const listAdminInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await inventoryService.listAdminInventory(req.query);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/inventory/:productId
 * Retrieves admin inventory details for a specific product.
 */
export const getAdminInventoryByProductId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const inventory = await inventoryService.getAdminInventoryByProductId(productId as string);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/inventory/:productId/adjust
 * Adjusts inventory for a product manually.
 */
export const adjustInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = inventoryAdjustmentSchema.safeParse({ params: req.params, body: req.body });
    if (!parseResult.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: parseResult.error.errors[0].message,
      });
      return;
    }
    const { change, reason, notes } = parseResult.data.body;
    const { productId } = parseResult.data.params;

    // We assume protect middleware puts user on req.user
    const adminUserId = (req as unknown as { user?: { _id: string } }).user?._id;

    const inventory = await inventoryService.adjustInventory(
      productId,
      change,
      reason,
      notes,
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/inventory/:productId/history
 * Fetches inventory transaction history for a specific product.
 */
export const getInventoryHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const result = await inventoryService.getInventoryHistory(productId as string, req.query);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};
