import { Types } from 'mongoose';
import { wishlistRepository } from '../repositories/wishlist.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { WishlistMapper } from '../mappers/wishlist.mapper.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { WishlistResponse, WishlistCardDTO } from '../types/wishlist.types.js';

export class WishlistService {
  /**
   * Retrieves the authenticated user's wishlist page.
   * Resolves inventory status and category data in batch to avoid N+1 queries.
   */
  async getWishlist(
    userId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<WishlistResponse> {
    const wishlist = await wishlistRepository.findByUserId(userId);
    if (!wishlist || wishlist.items.length === 0) {
      return {
        success: true,
        pagination: { page, limit, totalPages: 0, totalItems: 0 },
        products: [],
      };
    }

    const totalItems = wishlist.items.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Apply offset pagination on the array in memory for v1
    const skip = (page - 1) * limit;
    const paginatedItems = wishlist.items.slice(skip, skip + limit);

    if (paginatedItems.length === 0) {
      return {
        success: true,
        pagination: { page, limit, totalPages, totalItems },
        products: [],
      };
    }

    const productIds = paginatedItems.map((item) => item.productId);

    // Batch query product card details with lean projections
    const products = await productRepository.findWithDiscovery(
      { _id: { $in: productIds }, visibility: 'published' },
      { _id: 1, name: 1, slug: 1, price: 1, salePrice: 1, images: 1, categoryId: 1 },
      {},
      0,
      limit
    );

    // Batch resolve categories
    const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))];
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }, { _id: 1, name: 1, slug: 1 }).lean()
      : [];
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    // Batch resolve stock statuses (domain boundary check)
    const inStockIds = await inventoryRepository.getProductIdsInStock();
    const inStockSet = new Set(inStockIds.map((id) => id.toString()));

    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Map database structures to target DTOs preserving the original add order
    const cardDTOs: WishlistCardDTO[] = [];
    for (const item of paginatedItems) {
      const idStr = item.productId.toString();
      const product = productsMap.get(idStr);
      if (!product) {
        // Skips soft-deleted/un-published products
        continue;
      }
      const cat = product.categoryId
        ? (categoryMap.get(product.categoryId.toString()) ?? null)
        : null;
      const isAvailable = inStockSet.has(idStr);
      cardDTOs.push(WishlistMapper.toCardDTO(product, cat, isAvailable, item.addedAt));
    }

    return {
      success: true,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: cardDTOs.length, // Adjust count to reflect active/published items only
      },
      products: cardDTOs,
    };
  }

  /**
   * Helper checks whether a product is currently wishlisted.
   */
  async checkItemWishlisted(userId: Types.ObjectId, productId: Types.ObjectId): Promise<boolean> {
    return wishlistRepository.exists(userId, productId);
  }

  /**
   * Appends product ID atomically, enforcing a 200-item size constraint limit.
   */
  async addToWishlist(
    userId: Types.ObjectId,
    productId: Types.ObjectId
  ): Promise<WishlistResponse> {
    // 1. Confirm product is valid & published
    const product = await productRepository.findById(productId.toString());
    if (!product || product.visibility !== 'published') {
      throw new AppError(
        'Product not found or is not available for purchase',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 2. Fetch existing wishlist to verify size constraint
    const wishlist = await wishlistRepository.findByUserId(userId);
    if (wishlist && wishlist.items.length >= 200) {
      throw new AppError(
        'Wishlist has reached the maximum size cap of 200 items',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 3. Atomically add to array ($addToSet prevents duplicates)
    await wishlistRepository.addItem(userId, productId);

    // Fetch and return the updated first page of the wishlist
    return this.getWishlist(userId, 1, 12);
  }

  /**
   * Removes product ID atomically from wishlist array.
   */
  async removeFromWishlist(
    userId: Types.ObjectId,
    productId: Types.ObjectId
  ): Promise<WishlistResponse> {
    await wishlistRepository.removeItem(userId, productId);
    return this.getWishlist(userId, 1, 12);
  }

  /**
   * Sets items array to empty atomically.
   */
  async clearWishlist(userId: Types.ObjectId): Promise<WishlistResponse> {
    await wishlistRepository.clear(userId);
    return {
      success: true,
      pagination: { page: 1, limit: 12, totalPages: 0, totalItems: 0 },
      products: [],
    };
  }
}

export const wishlistService = new WishlistService();
