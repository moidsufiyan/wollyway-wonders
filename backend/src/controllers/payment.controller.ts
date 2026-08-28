import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Customer: Generate or reuse gateway payment intent for active checkout session.
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const { provider } = req.body;
    const result = await paymentService.createPaymentIntent(userId.toString(), provider);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gateway Webhook: Authoritative payment capture endpoint for Razorpay.
 * Public endpoint secured strictly by cryptographic HMAC SHA256 signature verification.
 */
export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature =
      (req.headers['x-razorpay-signature'] as string) ||
      (req.headers['X-Razorpay-Signature'] as string) ||
      '';

    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    const result = await paymentService.handleWebhook('razorpay', rawBody, signature, req.headers);

    res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      ...(result.orderId ? { orderId: result.orderId, orderNumber: result.orderNumber } : {}),
    });
  } catch (error) {
    next(error);
  }
};
