/**
 * @file product.repository.ts
 * @description Repository for all Product database access.
 *
 * Architecture: Everything becomes repository-driven. The ProductService
 * delegates all Mongoose calls here, making the service layer purely
 * orchestration logic. This pays off when Order, Cart, and Analytics
 * domains need to query products — they import this repository, not
 * the Product model directly.
 *
 * Naming convention (consistent across all domains):
 *   product.repository.ts
 *   inventory.repository.ts
 *   (future) category.repository.ts, order.repository.ts
 */

import { FilterQuery, Types } from 'mongoose';
import { Product, IProduct } from '../models/product.model.js';
import { Category } from '../models/category.model.js';

export class ProductRepository {
  // ---------------------------------------------------------------------------
  // Discovery
  // ---------------------------------------------------------------------------

  /**
   * Finds products matching a built query with full pagination support.
   * All discovery queries enforce a 2-second execution ceiling (maxTimeMS)
   * to prevent query-based slowdowns on shared Atlas clusters.
   */
  async findWithDiscovery(
    filter: FilterQuery<IProduct>,
    projection: Record<string, 1>,
    sort: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<IProduct[]> {
    return Product.find(filter, projection)
      .sort(sort as Parameters<ReturnType<typeof Product.find>['sort']>[0])
      .skip(skip)
      .limit(limit)
      .maxTimeMS(2000);
  }

  /**
   * Counts total documents matching a filter.
   * Used for pagination metadata on page 1 (or when explicitly requested).
   *
   * Performance note: countDocuments() is efficient on indexed fields.
   * For extremely large collections (100k+), consider maintaining a cached
   * count or switching to an estimated count for non-filtered queries.
   */
  async countWithFilter(filter: FilterQuery<IProduct>): Promise<number> {
    return Product.countDocuments(filter).maxTimeMS(2000);
  }

  /**
   * Resolves a categorySlug to its Category ObjectId.
   * Returns null if the category does not exist or is not active.
   * Used by the Discovery service before building the product filter.
   */
  async resolveCategorySlug(slug: string): Promise<Types.ObjectId | null> {
    const category = await Category.findOne({ slug, status: 'active' }, { _id: 1 }).lean();
    return category ? (category._id as Types.ObjectId) : null;
  }

  // ---------------------------------------------------------------------------
  // Standard Lookups (used by other service methods)
  // ---------------------------------------------------------------------------

  async findBySlug(slug: string, isAdmin = false): Promise<IProduct | null> {
    const query: FilterQuery<IProduct> = { slug };
    if (!isAdmin) {
      query.visibility = { $in: ['published', 'hidden'] };
    }
    return Product.findOne(query);
  }

  async findFeatured(): Promise<IProduct[]> {
    return Product.find({ visibility: 'published', featured: true }).sort({
      createdAt: -1,
    });
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id);
  }
}

export const productRepository = new ProductRepository();
