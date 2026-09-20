import { Request, Response, NextFunction } from 'express';
import { adminCustomerService, AdminCustomerService } from '../services/admin-customer.service.js';
import {
  adminCustomerListQuerySchema,
  adminCustomerStatusUpdateSchema,
} from '../validators/admin-customer.validator.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AdminCustomerController {
  constructor(private readonly service: AdminCustomerService = adminCustomerService) {}

  /**
   * GET /api/v1/admin/customers
   */
  public getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = adminCustomerListQuerySchema.parse(req.query);
      const result = await this.service.getCustomers(query);
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/customers/:id
   */
  public getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getCustomerById(String(req.params.id));
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/admin/customers/:id/status
   */
  public updateCustomerStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = adminCustomerStatusUpdateSchema.parse(req.body);
      const adminId = req.user!._id.toString();

      const result = await this.service.updateCustomerStatus(
        String(req.params.id),
        status,
        adminId
      );
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const adminCustomerController = new AdminCustomerController();
