import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { wishlistService } from '../services/wishlist.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

export const getWishlist = async (
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
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const wishlist = await wishlistService.getWishlist(
      userId as unknown as Types.ObjectId,
      page,
      limit
    );
    res.status(HTTP_STATUS.OK).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const checkWishlistStatus = async (
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
    const wishlisted = await wishlistService.checkItemWishlisted(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string)
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      wishlisted,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (
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
    const wishlist = await wishlistService.addToWishlist(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string)
    );

    res.status(HTTP_STATUS.CREATED).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
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
    const wishlist = await wishlistService.removeFromWishlist(
      userId as unknown as Types.ObjectId,
      new Types.ObjectId(productId as string)
    );

    res.status(HTTP_STATUS.OK).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    const wishlist = await wishlistService.clearWishlist(userId as unknown as Types.ObjectId);
    res.status(HTTP_STATUS.OK).json(wishlist);
  } catch (error) {
    next(error);
  }
};
