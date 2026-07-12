import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

export const getFeaturedProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await productService.getFeaturedProducts();
    res.status(HTTP_STATUS.OK).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const product = await productService.getProductBySlug(req.params.slug as string, isAdmin);
    res.status(HTTP_STATUS.OK).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const discoverProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await productService.discoverProducts(req.query);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.createProduct(req.body, adminUserId);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product draft created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.updateProduct(
      req.params.id as string,
      req.body,
      adminUserId
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.archiveProduct(req.params.id as string, adminUserId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('No image files provided for upload', HTTP_STATUS.BAD_REQUEST);
    }

    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.uploadProductImages(
      req.params.id as string,
      files,
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Images uploaded successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const replaceProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No image file provided for replacement', HTTP_STATUS.BAD_REQUEST);
    }

    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.replaceProductImage(
      req.params.id as string,
      req.params.publicId as string,
      req.file,
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Image replaced successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?._id ? req.user._id.toString() : undefined;
    const product = await productService.deleteProductImage(
      req.params.id as string,
      req.params.publicId as string,
      adminUserId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Image deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
