import { Types, FilterQuery } from 'mongoose';
import { Product, IProduct } from '../models/product.model.js';
import { Inventory } from '../models/inventory.model.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

interface QueryOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  tags?: string;
  sort?: string;
  isAdmin?: boolean;
}

export class ProductService {
  // Helpers
  private normalizeTags(tags?: string[]): string[] {
    if (!tags || tags.length === 0) return [];
    const normalized = tags.map((t) => t.toLowerCase().trim()).filter((t) => t.length > 0);
    return Array.from(new Set(normalized)); // deduplicate
  }

  private validatePublishGuards(product: Partial<IProduct>) {
    if (product.visibility === 'published') {
      if (product.price === undefined || product.price === null) {
        throw new AppError('Price is required to publish a product', HTTP_STATUS.BAD_REQUEST);
      }
      if (!product.categoryId) {
        throw new AppError('Category is required to publish a product', HTTP_STATUS.BAD_REQUEST);
      }
      if (!product.images || product.images.length === 0) {
        throw new AppError(
          'At least one image is required to publish a product',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const primaryCount = product.images.filter((img) => img.isPrimary).length;
      if (primaryCount !== 1) {
        throw new AppError(
          'A published product must have exactly ONE primary image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
  }

  private validateDiscount(price?: number, salePrice?: number) {
    if (price !== undefined && salePrice !== undefined) {
      if (salePrice >= price) {
        throw new AppError(
          'Sale price must be strictly less than the base price',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
  }

  // Queries
  public async getFeaturedProducts(): Promise<IProduct[]> {
    return Product.find({ visibility: 'published', featured: true }).sort({ createdAt: -1 });
  }

  public async getProductBySlug(slug: string, isAdmin = false): Promise<IProduct> {
    const query: FilterQuery<IProduct> = { slug };
    if (!isAdmin) {
      query.visibility = { $in: ['published', 'hidden'] }; // Customers can view hidden if they have the exact link, but not draft/archived
    }
    const product = await Product.findOne(query);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return product;
  }

  public async getAllProducts(
    options: QueryOptions
  ): Promise<{ data: IProduct[]; total: number; page: number; totalPages: number }> {
    const query: FilterQuery<IProduct> = {};
    if (!options.isAdmin) {
      query.visibility = 'published';
    }

    if (options.categoryId) {
      query.categoryId = new Types.ObjectId(options.categoryId);
    }
    if (options.tags) {
      const tagList = options.tags.split(',').map((t) => t.trim().toLowerCase());
      query.tags = { $all: tagList };
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (options.sort) {
      const sortField = options.sort.startsWith('-') ? options.sort.substring(1) : options.sort;
      const sortOrder = options.sort.startsWith('-') ? -1 : 1;
      sortObj = { [sortField]: sortOrder };
    }

    const [data, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async searchProducts(searchTerm: string): Promise<IProduct[]> {
    if (!searchTerm || searchTerm.trim().length === 0) return [];

    return Product.find(
      {
        $text: { $search: searchTerm },
        visibility: 'published',
      },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }

  // Mutations
  public async createProduct(data: Partial<IProduct>, adminUserId?: string): Promise<IProduct> {
    // 1. Verify Category
    const categoryExists = await Category.findById(data.categoryId);
    if (!categoryExists) {
      throw new AppError('Referenced Category does not exist', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Normalize and check constraints
    data.tags = this.normalizeTags(data.tags);
    data.visibility = 'draft'; // Always force draft on creation for safety
    this.validateDiscount(data.price, data.salePrice);

    data.createdBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;

    // 3. Save Product
    const product = new Product(data);
    await product.save();

    // 4. Initialize Inventory (Decoupled lifecycle hook)
    const inventory = new Inventory({
      productId: product._id,
      available: 0,
      reserved: 0,
      sold: 0,
    });
    await inventory.save();

    return product;
  }

  public async updateProduct(
    id: string,
    data: Partial<IProduct>,
    adminUserId?: string
  ): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    if (product.visibility === 'archived') {
      throw new AppError(
        'Archived products cannot be updated. Restore them first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Category Validation
    if (data.categoryId && data.categoryId.toString() !== product.categoryId.toString()) {
      const categoryExists = await Category.findById(data.categoryId);
      if (!categoryExists)
        throw new AppError('Referenced Category does not exist', HTTP_STATUS.NOT_FOUND);
    }

    // Slug Immutability
    if (product.visibility === 'published' && data.slug && data.slug !== product.slug) {
      // In a real system, you might allow this via a special bypass role. For standard updates, we block it.
      throw new AppError(
        'Cannot modify the slug of a published product to preserve SEO links.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Tag Normalization
    if (data.tags !== undefined) {
      data.tags = this.normalizeTags(data.tags);
    }

    // Prepare merged state to validate guards
    const mergedState: Partial<IProduct> = {
      ...product.toObject(),
      ...data,
    };

    this.validateDiscount(mergedState.price, mergedState.salePrice);
    this.validatePublishGuards(mergedState);

    // Apply updates
    Object.assign(product, data);
    product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;

    await product.save();
    return product;
  }

  public async archiveProduct(id: string, adminUserId?: string): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);

    // 1. Check unsettled orders (Mock placeholder for future Order Domain logic)
    // const activeOrders = await Orders.count({ productId: id, status: 'pending' });
    // if (activeOrders > 0) throw new AppError('Cannot archive product with active orders pending.', 400);

    // 2. Cascade Archive
    product.visibility = 'archived';
    product.archivedAt = new Date();
    product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;
    await product.save();

    return product;
  }
}

export const productService = new ProductService();
