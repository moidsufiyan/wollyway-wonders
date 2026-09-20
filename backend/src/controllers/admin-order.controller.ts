import { Request, Response } from 'express';
import { orderService } from '../services/order.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AdminOrderQueryParams } from '../types/admin-order.types.js';

export const listOrders = async (req: Request, res: Response) => {
  const resultData = await orderService.listAdminOrders(
    req.query as unknown as AdminOrderQueryParams
  );
  res.status(HTTP_STATUS.OK).json(resultData);
};

export const getAdminOrderById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const order = await orderService.getAdminOrderById(id);
  res.status(HTTP_STATUS.OK).json({ success: true, data: order });
};

export const updateAdminOrderStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.user!._id.toString();

  const order = await orderService.updateOrderStatus(id, req.body, adminId);
  res.status(HTTP_STATUS.OK).json({ success: true, data: order });
};

export const cancelAdminOrder = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.user!._id.toString();
  const reason = req.body?.reason;

  const order = await orderService.cancelOrder(id, reason, adminId, true);
  res.status(HTTP_STATUS.OK).json({ success: true, data: order });
};
