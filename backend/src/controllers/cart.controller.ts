import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { cartService } from '../services/cart.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const cart = await cartService.getCart(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string),
      quantity
    );

    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateQuantity(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string),
      quantity
    );

    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const { productId } = req.params;
    const cart = await cartService.removeItem(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string)
    );

    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const cart = await cartService.clearCart(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const moveFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const { productId } = req.body;
    const cart = await cartService.moveFromWishlist(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string)
    );

    res.status(HTTP_STATUS.OK).json(cart);
  } catch (error) {
    next(error);
  }
};
