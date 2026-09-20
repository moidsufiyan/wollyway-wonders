/**
 * @file admin-product.service.ts
 * @description Admin-only product listing service.
 *
 * This service is purpose-built for the admin catalog management view.
 * It bypasses the public Discovery filter (visibility: 'published') and
 * queries all products across every visibility state:
 *   draft | published | hidden | archived
 *
 * It reuses existing repositories and mappers — only the filter is different.
 */

import { z } from 'zod';
import { FilterQuery, Types } from 'mongoose';
import { Product, IProduct } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { ParsedQs } from 'qs';
import type {
  AdminProductCardDTO,
  AdminProductDetailDTO,
  AdminProductDetailImageDTO,
  AdminProductListResult,
  AdminProductQueryParams,
  AdminProductSortOption,
  AdminProductAvailabilityDTO,
  ProductVisibility,
} from '../types/admin-product.types.js';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

const ADMIN_SORT_OPTIONS: AdminProductSortOption[] = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
];

const VISIBILITY_OPTIONS: ProductVisibility[] = ['draft', 'published', 'hidden', 'archived'];

const adminProductQuerySchema = z.object({
  q: z.string().max(100, 'Search query cannot exceed 100 characters').optional(),
  visibility: z
    .enum(['all', ...VISIBILITY_OPTIONS] as ['all', ...ProductVisibility[]])
    .default('all'),
  featured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .pipe(z.boolean().optional()),
  sort: z
    .enum(ADMIN_SORT_OPTIONS as [AdminProductSortOption, ...AdminProductSortOption[]])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ---------------------------------------------------------------------------
// Sort Map
// ---------------------------------------------------------------------------

const SORT_MAP: Record<AdminProductSortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

// ---------------------------------------------------------------------------
// Admin Product Service
// ---------------------------------------------------------------------------

export class AdminProductService {
  /**
   * Lists products for the admin catalog view.
   * Returns all visibility states (draft, published, hidden, archived).
   * Supports search, visibility filter, featured filter, sorting, and pagination.
   */
  public async listProducts(rawQuery: ParsedQs): Promise<AdminProductListResult> {
    // 1. Parse and validate query params
    const parseResult = adminProductQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new AppError(
        firstIssue?.message ?? 'Invalid query parameters',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const params = parseResult.data as AdminProductQueryParams & {
      sort: AdminProductSortOption;
      page: number;
      limit: number;
    };

    // 2. Build Mongoose filter — no implicit visibility restriction for admin
    const filter: FilterQuery<IProduct> = {};

    // Full-text search on name/tags/materials/shortDescription (text index)
    if (params.q) {
      filter.$text = { $search: params.q };
    }

    // Visibility filter
    if (params.visibility && params.visibility !== 'all') {
      filter.visibility = params.visibility;
    }

    // Featured filter
    if (params.featured === true) {
      filter.featured = true;
    } else if (params.featured === false) {
      filter.featured = false;
    }

    // 3. Build projection (admin DTO fields)
    const projection: Record<string, 1> = {
      _id: 1,
      name: 1,
      slug: 1,
      shortDescription: 1,
      price: 1,
      salePrice: 1,
      images: 1,
      featured: 1,
      visibility: 1,
      categoryId: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    // 4. Sort
    const sort =
      params.sort === 'newest' && params.q
        ? ({ score: { $meta: 'textScore' } } as Record<string, unknown>)
        : SORT_MAP[params.sort as AdminProductSortOption];

    const limit = params.limit as number;
    const page = params.page as number;
    const skip = (page - 1) * limit;

    // 5. Execute paginated query and count in parallel
    const [products, totalItems] = await Promise.all([
      Product.find(filter, projection)
        .sort(sort as Parameters<ReturnType<typeof Product.find>['sort']>[0])
        .skip(skip)
        .limit(limit)
        .maxTimeMS(2000),
      Product.countDocuments(filter).maxTimeMS(2000),
    ]);

    // 6. Resolve category info — single query, not N+1
    const categoryIds = [...new Set(products.map((p) => p.categoryId?.toString()).filter(Boolean))];
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }, { _id: 1, name: 1, slug: 1 }).lean()
      : [];
    const categoryMap = new Map(
      categories.map((c) => [
        (c._id as Types.ObjectId).toString(),
        { _id: (c._id as Types.ObjectId).toString(), name: c.name, slug: c.slug },
      ])
    );

    // 7. Resolve availability (inventory) — single query, not N+1
    const allInStockIds = await inventoryRepository.getProductIdsInStock();
    const inStockSet = new Set(allInStockIds.map((id) => id.toString()));

    // 8. Map to AdminProductCardDTOs
    const productDTOs: AdminProductCardDTO[] = products.map((product) => {
      const primaryImage = (product.images ?? []).find((img) => img.isPrimary) ?? null;
      const catInfo = categoryMap.get(product.categoryId?.toString()) ?? null;
      const idStr = (product._id as Types.ObjectId).toString();

      const availability: AdminProductAvailabilityDTO = inStockSet.has(idStr)
        ? { status: 'IN_STOCK', label: 'In Stock' }
        : { status: 'OUT_OF_STOCK', label: 'Out of Stock' };

      return {
        _id: idStr,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        price: product.price,
        salePrice: product.salePrice,
        primaryImage: primaryImage
          ? {
              url: primaryImage.url,
              alt: primaryImage.alt,
              width: primaryImage.width,
              height: primaryImage.height,
            }
          : null,
        featured: product.featured,
        visibility: product.visibility as ProductVisibility,
        category: catInfo,
        availability,
        createdAt: (product.createdAt as Date).toISOString(),
        updatedAt: (product.updatedAt as Date).toISOString(),
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      results: productDTOs.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      filters: {
        q: params.q,
        visibility: params.visibility,
        featured: params.featured,
      },
      sort: params.sort as AdminProductSortOption,
      products: productDTOs,
    };
  }
  /**
   * Fetches a single product by ID for the admin edit view.
   * Returns the full product document including all images with publicId, isPrimary, displayOrder.
   */
  public async getProduct(id: string): Promise<AdminProductDetailDTO> {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const category = product.categoryId
      ? await Category.findById(product.categoryId, { _id: 1, name: 1, slug: 1 }).lean()
      : null;

    const images: AdminProductDetailImageDTO[] = (product.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt,
      width: img.width,
      height: img.height,
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    }));

    return {
      _id: (product._id as Types.ObjectId).toString(),
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      images,
      materials: product.materials ?? [],
      careInstructions: product.careInstructions,
      isCustomizable: product.isCustomizable,
      estimatedProductionDays: product.estimatedProductionDays,
      tags: product.tags ?? [],
      featured: product.featured,
      visibility: product.visibility as ProductVisibility,
      category: category
        ? {
            _id: (category._id as Types.ObjectId).toString(),
            name: category.name,
            slug: category.slug,
          }
        : null,
      createdAt: (product.createdAt as Date).toISOString(),
      updatedAt: (product.updatedAt as Date).toISOString(),
    };
  }
}

export const adminProductService = new AdminProductService();
