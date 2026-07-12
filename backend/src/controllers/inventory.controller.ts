import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { HTTP_STATUS } from '../constants/index.js';

// GET /api/v1/inventory/:productId
export const getInventoryByProductId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const result = await inventoryService.getInventoryByProductId(productId as string);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/inventory/:productId
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

// POST /api/v1/inventory/adjust
export const adjustInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, change, reason, notes } = req.body;
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;

    const inventory = await inventoryService.adjustInventory(
      productId,
      change,
      reason,
      notes,
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Stock adjusted successfully.',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/inventory/:productId/settings
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { lowStockThreshold, trackInventory } = req.body;
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;

    const inventory = await inventoryService.updateSettings(
      productId as string,
      { lowStockThreshold, trackInventory },
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Inventory configuration settings updated.',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/inventory/reserve (Stub route placeholder)
export const reserveInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Inventory reservation placeholder stub. No actions taken.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/inventory/release (Stub route placeholder)
export const releaseInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Inventory release placeholder stub. No actions taken.',
    });
  } catch (error) {
    next(error);
  }
};
