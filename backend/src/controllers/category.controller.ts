import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, MAX_FEATURED_CATEGORIES } from '../constants/index.js';

// GET /api/v1/categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { status: 'active' };

    // Support featured filter query
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    // Admins can see hidden categories (exclude archived by default)
    if (req.user?.role === 'admin') {
      delete filter.status;
      filter.status = { $ne: 'archived' };

      if (
        req.query.status &&
        ['active', 'hidden', 'archived'].includes(req.query.status as string)
      ) {
        filter.status = req.query.status;
      }
    }

    // Sort by sortOrder ASC, then name ASC
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categories/:slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category || category.status === 'archived') {
      return next(new AppError('Category not found.', HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/categories
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image, status, sortOrder, featured, seo, parentId } = req.body;

    // 1. Verify featured category count limit
    if (featured === true) {
      const activeFeaturedCount = await Category.countDocuments({
        featured: true,
        status: { $ne: 'archived' },
      });

      if (activeFeaturedCount >= MAX_FEATURED_CATEGORIES) {
        return next(
          new AppError(
            `Cannot exceed maximum limit of ${MAX_FEATURED_CATEGORIES} featured categories.`,
            HTTP_STATUS.BAD_REQUEST
          )
        );
      }
    }

    // 2. Build Category
    const category = new Category({
      name,
      description,
      image,
      status,
      sortOrder,
      featured,
      seo,
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    await category.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/categories/:id
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const category = await Category.findById(id);
    if (!category || category.status === 'archived') {
      return next(new AppError('Category not found.', HTTP_STATUS.NOT_FOUND));
    }

    // 1. Verify featured category count limit on updates
    if (updateData.featured === true && category.featured !== true) {
      const activeFeaturedCount = await Category.countDocuments({
        featured: true,
        status: { $ne: 'archived' },
        _id: { $ne: new Types.ObjectId(id as string) },
      });

      if (activeFeaturedCount >= MAX_FEATURED_CATEGORIES) {
        return next(
          new AppError(
            `Cannot exceed maximum limit of ${MAX_FEATURED_CATEGORIES} featured categories.`,
            HTTP_STATUS.BAD_REQUEST
          )
        );
      }
    }

    // 2. Set update auditors
    updateData.updatedBy = req.user?._id || null;

    // 3. Map parentId reference if passed
    if (updateData.parentId) {
      updateData.parentId = new Types.ObjectId(updateData.parentId);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/categories/:id (Archive soft-delete)
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category || category.status === 'archived') {
      return next(new AppError('Category not found.', HTTP_STATUS.NOT_FOUND));
    }

    // 1. Enforce active products checks directly in products collection
    const activeProductsCount =
      (await mongoose.connection.db?.collection('products')?.countDocuments({
        categoryId: new Types.ObjectId(id as string),
        status: { $ne: 'archived' },
      })) || 0;

    if (activeProductsCount > 0) {
      return next(
        new AppError('Cannot delete category containing active products.', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // 2. Perform soft-delete archiving
    category.status = 'archived';
    category.archivedAt = new Date();
    category.updatedBy = req.user?._id || null;
    await category.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Category archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};
