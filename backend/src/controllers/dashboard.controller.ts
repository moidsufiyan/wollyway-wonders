import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Admin: Retrieve consolidated dashboard analytics and recent orders.
 */
export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardData();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
