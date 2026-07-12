import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { HTTP_STATUS } from '../constants/index.js';

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

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin' && req.query.adminView === 'true';
    const options = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      categoryId: req.query.categoryId as string,
      tags: req.query.tags as string,
      sort: req.query.sort as string,
      isAdmin,
    };

    const result = await productService.getAllProducts(options);
    res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;
    const products = await productService.searchProducts(q as string);
    res.status(HTTP_STATUS.OK).json({ success: true, data: products });
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
