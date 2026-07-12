import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { checkoutService } from '../services/checkout.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

export const startCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const summary = await checkoutService.startCheckout(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      checkout: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const summary = await checkoutService.getCurrentCheckout(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      checkout: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const extendCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const summary = await checkoutService.extendCheckout(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      checkout: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const idempotencyKey = req.headers['idempotency-key'] as string;
    const { paymentProvider } = req.body;

    const summary = await checkoutService.confirmCheckout(
      userId as unknown as Types.ObjectId,
      idempotencyKey,
      paymentProvider
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      checkout: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    await checkoutService.cancelCheckout(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Checkout cancelled and stock locks released.',
    });
  } catch (error) {
    next(error);
  }
};
