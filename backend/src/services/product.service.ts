import { Types } from 'mongoose';
import { IProduct, IImage, Product } from '../models/product.model.js';
import { Inventory } from '../models/inventory.model.js';
import { Category } from '../models/category.model.js';
import { cloudinaryService } from './cloudinary.service.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { ParsedQs } from 'qs';
import { ProductQueryBuilder } from '../builders/product.query-builder.js';
import { productRepository } from '../repositories/product.repository.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { ProductMapper } from '../mappers/product.mapper.js';
import type { DiscoveryResult } from '../types/discovery.types.js';

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
    return productRepository.findFeatured();
  }

  public async getProductBySlug(slug: string, isAdmin = false): Promise<IProduct> {
    const product = await productRepository.findBySlug(slug, isAdmin);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }
    return product;
  }

  /**
   * Unified product discovery endpoint handler.
   *
   * Flow:
   *   1. ProductQueryBuilder — parse, normalize, validate raw query params
   *   2. (Optional) InventoryRepository — resolve in-stock product IDs
   *   3. (Optional) ProductRepository.resolveCategorySlug — resolve slug → ObjectId
   *   4. ProductRepository.findWithDiscovery — execute query (maxTimeMS: 2000)
   *   5. ProductRepository.countWithFilter — pagination metadata
   *   6. ProductMapper.toCardDTO — transform documents to lean DTOs
   */
  public async discoverProducts(rawQuery: ParsedQs): Promise<DiscoveryResult> {
    // Step 1: Build query via Query Builder (validates & normalizes params)
    const builder = new ProductQueryBuilder(rawQuery);
    const { filter, sort, projection, skip, limit, params } = builder.build();

    // Step 2: Resolve availability filter (domain boundary — no Inventory schema leakage)
    let inStockIds: Set<string> | null = null;
    if (params.availability === 'in_stock') {
      const ids = await inventoryRepository.getProductIdsInStock();
      inStockIds = new Set(ids.map((id) => id.toString()));
      filter._id = { $in: ids };
    }

    // Step 3: Resolve categorySlug → categoryId (slug-based filtering)
    if (params.categorySlug) {
      const categoryId = await productRepository.resolveCategorySlug(params.categorySlug);
      if (!categoryId) {
        // Unknown slug → return empty result rather than erroring (resilient API)
        return this.buildEmptyResult(params);
      }
      filter.categoryId = categoryId;
    }

    // Step 4 & 5: Execute paginated query and count in parallel
    const [products, totalItems] = await Promise.all([
      productRepository.findWithDiscovery(filter, projection, sort, skip, limit),
      productRepository.countWithFilter(filter),
    ]);

    // Step 6: Resolve category info for all result products (single query, not N+1)
    const categoryIds = [...new Set(products.map((p) => p.categoryId?.toString()).filter(Boolean))];
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }, { _id: 1, name: 1, slug: 1 }).lean()
      : [];
    const categoryMap = new Map(
      categories.map((c) => [
        (c._id as Types.ObjectId).toString(),
        { _id: c._id as Types.ObjectId, name: c.name, slug: c.slug },
      ])
    );

    // Step 7: Map to ProductCardDTOs
    const productDTOs = products.map((product) => {
      const catInfo = categoryMap.get(product.categoryId?.toString()) ?? null;
      const availability = inStockIds
        ? ProductMapper.resolveAvailability(product._id as Types.ObjectId, inStockIds)
        : { status: 'IN_STOCK' as const, label: 'In Stock' }; // default when availability=all
      return ProductMapper.toCardDTO(product, catInfo, availability);
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      results: productDTOs.length,
      query: { q: params.q },
      pagination: {
        page: params.page,
        limit,
        totalPages,
        totalItems,
      },
      filters: {
        categorySlug: params.categorySlug,
        price:
          params.minPrice !== undefined || params.maxPrice !== undefined
            ? { min: params.minPrice, max: params.maxPrice }
            : undefined,
        tags: params.tags,
        materials: params.materials,
        availability: params.availability,
        featured: params.featured,
      },
      sort: params.sort,
      products: productDTOs,
    };
  }

  /** Returns a typed empty discovery result for cases like unknown categorySlug */
  private buildEmptyResult(
    params: ReturnType<ProductQueryBuilder['build']>['params']
  ): DiscoveryResult {
    return {
      success: true,
      results: 0,
      query: { q: params.q },
      pagination: { page: params.page, limit: params.limit, totalPages: 0, totalItems: 0 },
      filters: {
        categorySlug: params.categorySlug,
        availability: params.availability,
      },
      sort: params.sort,
      products: [],
    };
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

    // 1. Guard against archiving products with active fulfillment orders (CONFIRMED, PROCESSING, SHIPPED)
    const hasActiveOrders = await orderRepository.hasActiveOrdersForProduct(
      product._id as Types.ObjectId
    );
    if (hasActiveOrders) {
      throw new AppError(
        'Cannot archive product with active orders pending fulfillment.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 2. Cascade Archive
    product.visibility = 'archived';
    product.archivedAt = new Date();
    product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;
    await product.save();

    return product;
  }

  public async uploadProductImages(
    productId: string,
    files: Express.Multer.File[],
    adminUserId?: string
  ): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);

    if (product.visibility === 'archived') {
      throw new AppError('Cannot upload images to an archived product', HTTP_STATUS.BAD_REQUEST);
    }

    const currentImageCount = product.images?.length || 0;
    if (currentImageCount + files.length > 10) {
      throw new AppError(
        'Uploading these files would exceed the maximum limit of 10 images',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const uploadedPublicIds: string[] = [];
    const newImagesList: IImage[] = [];

    try {
      let index = currentImageCount;
      for (const file of files) {
        const publicId = cloudinaryService.generateProductPublicId(product.slug);
        const result = await cloudinaryService.uploadStream(file.buffer, publicId);

        uploadedPublicIds.push(result.publicId);
        newImagesList.push({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          isPrimary: false,
          displayOrder: index,
          alt: `${product.name} - Image ${index + 1}`, // Default auto-generated alt text
        });

        index++;
      }

      // If no image is currently marked primary, and we uploaded at least one, make the first one primary
      const hasPrimary = product.images.some((img) => img.isPrimary);
      if (!hasPrimary && newImagesList.length > 0) {
        newImagesList[0].isPrimary = true;
      }

      product.images.push(...newImagesList);
      product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;

      await product.save();
      return product;
    } catch (error) {
      // Rollback: delete newly uploaded assets from Cloudinary in case DB write failed
      if (uploadedPublicIds.length > 0) {
        await cloudinaryService.deleteAssetsConcurrently(uploadedPublicIds);
      }
      throw error;
    }
  }

  public async replaceProductImage(
    productId: string,
    oldPublicId: string,
    file: Express.Multer.File,
    adminUserId?: string
  ): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);

    if (product.visibility === 'archived') {
      throw new AppError('Cannot modify images on an archived product', HTTP_STATUS.BAD_REQUEST);
    }

    const imageIndex = product.images.findIndex((img) => img.publicId === oldPublicId);
    if (imageIndex === -1) {
      throw new AppError('Target image to replace not found', HTTP_STATUS.NOT_FOUND);
    }

    // Dynamic signed upload of new asset
    const newPublicId = cloudinaryService.generateProductPublicId(product.slug);
    const uploadResult = await cloudinaryService.uploadStream(file.buffer, newPublicId);

    try {
      const oldImage = product.images[imageIndex];

      // Update database schema and clear old cache/CDN transformation contexts
      product.images[imageIndex] = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        isPrimary: oldImage.isPrimary,
        displayOrder: oldImage.displayOrder,
        alt: oldImage.alt,
      };

      product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;

      await product.save();

      // Only delete old Cloudinary asset if DB write succeeded (Optimistic write / Safe rollback pattern)
      await cloudinaryService.deleteAsset(oldPublicId);

      return product;
    } catch (error) {
      // Rollback newly uploaded asset if DB write failed
      await cloudinaryService.deleteAsset(uploadResult.publicId);
      throw error;
    }
  }

  public async deleteProductImage(
    productId: string,
    publicId: string,
    adminUserId?: string
  ): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);

    if (product.visibility === 'archived') {
      throw new AppError('Cannot delete images from an archived product', HTTP_STATUS.BAD_REQUEST);
    }

    const imageIndex = product.images.findIndex((img) => img.publicId === publicId);
    if (imageIndex === -1) {
      throw new AppError('Image not found', HTTP_STATUS.NOT_FOUND);
    }

    const wasPrimary = product.images[imageIndex].isPrimary;

    // Remove metadata record from array
    product.images.splice(imageIndex, 1);

    // Maintain exactly-one-primary image constraint: promote another remaining image if the deleted one was primary
    if (wasPrimary && product.images.length > 0) {
      product.images[0].isPrimary = true;
    }

    // Apply visibility/publishing guards
    this.validatePublishGuards(product);

    product.updatedBy = adminUserId ? new Types.ObjectId(adminUserId) : undefined;
    await product.save();

    // Call Cloudinary to destroy asset after DB write succeeded
    await cloudinaryService.deleteAsset(publicId);

    return product;
  }
}

export const productService = new ProductService();
