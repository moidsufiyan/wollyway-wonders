import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import { AdminOrderFilterQuery, OrderStatus } from '../types/order.types.js';

/**
 * Customer: Retrieve paginated list of own orders.
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await orderService.getMyOrders(userId.toString(), page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Retrieve detailed receipt for a specific order.
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const order = await orderService.getOrderById(userId.toString(), id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Cancel an active (CONFIRMED/PROCESSING) order.
 */
export const cancelMyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(
      id,
      reason || 'Customer requested cancellation',
      userId.toString(),
      false
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order has been successfully cancelled and inventory restocked.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Retrieve paginated orders with multi-parameter filtering.
 */
export const getAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: AdminOrderFilterQuery = {
      status: req.query.status as OrderStatus | undefined,
      orderNumber: req.query.orderNumber as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    const result = await orderService.getAdminOrders(filters);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Retrieve comprehensive order detail by ID or order number.
 */
export const getAdminOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await orderService.getAdminOrderById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update fulfillment state and tracking details.
 */
export const adminUpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, carrier, trackingNumber, notes } = req.body;

    const adminUserId = req.user?._id?.toString();
    if (!adminUserId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const order = await orderService.updateOrderStatus(
      id,
      {
        status,
        carrier,
        trackingNumber,
        notes,
      },
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Force cancellation and inventory restocking.
 */
export const adminCancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?._id?.toString();
    const id = req.params.id as string;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(id, reason, adminUserId, true);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order has been cancelled and inventory restocked by administrator.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
