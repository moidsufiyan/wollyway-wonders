import mongoose, { Types } from 'mongoose';
import { cartRepository } from '../repositories/cart.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { wishlistRepository } from '../repositories/wishlist.repository.js';
import { CartItemMapper } from '../mappers/cart-item.mapper.js';
import { CartMapper } from '../mappers/cart.mapper.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, MAX_CART_ITEM_QUANTITY } from '../constants/index.js';
import { CartDTO } from '../types/cart.types.js';

export class CartService {
  /**
   * Helper sleep to handle exponential backoff during version conflicts.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retrieves the active user's cart, calculating current prices and stock availability dynamically.
   */
  async getCart(userId: Types.ObjectId): Promise<CartDTO> {
    // Atomically find or create the cart
    const cart = await cartRepository.upsertCart(userId);

    if (cart.items.length === 0) {
      return CartMapper.toDTO(cart, []);
    }

    const productIds = cart.items.map((item) => item.productId);

    // Batch query product card details with lean projections
    const products = await productRepository.findWithDiscovery(
      { _id: { $in: productIds } },
      { _id: 1, name: 1, slug: 1, price: 1, salePrice: 1, images: 1, categoryId: 1, visibility: 1 },
      {},
      0,
      cart.items.length
    );

    // Batch resolve categories
    const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))];
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }, { _id: 1, name: 1, slug: 1 }).lean()
      : [];
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    // Batch resolve stock levels from inventory domain
    const stockMap = await inventoryRepository.getBatchStock(productIds);
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    const itemDTOs = cart.items.map((item) => {
      const idStr = item.productId.toString();
      const product = productsMap.get(idStr) ?? null;
      const cat = product?.categoryId
        ? (categoryMap.get(product.categoryId.toString()) ?? null)
        : null;
      const stock = stockMap.get(idStr) ?? 0;

      return CartItemMapper.toDTO(item, product, cat, stock);
    });

    return CartMapper.toDTO(cart, itemDTOs);
  }

  /**
   * Appends an item atomically to the cart.
   * If already present, validates and increments quantity.
   */
  async addItem(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    quantity: number
  ): Promise<CartDTO> {
    // 1. Confirm product is valid & published
    const product = await productRepository.findById(productId.toString());
    if (!product || product.visibility !== 'published') {
      throw new AppError(
        'Product not found or is not available for purchase',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 2. Fetch or create cart
    const cart = await cartRepository.upsertCart(userId);

    // Check unique items count limit (50 max)
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    if (!existingItem && cart.items.length >= 50) {
      throw new AppError(
        'Cart has reached the maximum size cap of 50 unique items',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate stock levels
    const availableStock = await inventoryRepository.getAvailableStock(productId);
    const newQty = existingItem ? existingItem.quantity + quantity : quantity;

    if (newQty > availableStock) {
      throw new AppError(
        `Requested quantity exceeds available stock (${availableStock} items left)`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (newQty > MAX_CART_ITEM_QUANTITY) {
      throw new AppError(
        `Quantity limit exceeded. Maximum allowed per item is ${MAX_CART_ITEM_QUANTITY} units`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 3. Atomically add or update quantity
    if (existingItem) {
      await cartRepository.updateQuantity(userId, productId, newQty);
    } else {
      await cartRepository.addItem(userId, {
        productId,
        quantity,
        priceSnapshot: product.price,
        addedAt: new Date(),
      });
    }

    return this.getCart(userId);
  }

  /**
   * Updates an item's quantity atomically with version retry capabilities.
   */
  async updateQuantity(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    quantity: number
  ): Promise<CartDTO> {
    // Validate quantity limits
    if (quantity > MAX_CART_ITEM_QUANTITY) {
      throw new AppError(
        `Quantity limit exceeded. Maximum allowed per item is ${MAX_CART_ITEM_QUANTITY} units`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate stock levels
    const availableStock = await inventoryRepository.getAvailableStock(productId);
    if (quantity > availableStock) {
      throw new AppError(
        `Requested quantity exceeds available stock (${availableStock} items left)`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const backoffs = [50, 100, 200];
    let attempts = 0;

    while (attempts <= 3) {
      try {
        const cart = await cartRepository.updateQuantity(userId, productId, quantity);
        if (!cart) {
          throw new AppError('Cart or item not found', HTTP_STATUS.NOT_FOUND);
        }
        return this.getCart(userId);
      } catch (error: unknown) {
        const err = error as { name?: string };
        if (err.name === 'VersionError' && attempts < 3) {
          const delay = backoffs[attempts];
          attempts++;
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw new AppError(
      'Cart was updated concurrently in another request. Please try again.',
      HTTP_STATUS.CONFLICT
    );
  }

  /**
   * Removes an item from the cart.
   */
  async removeItem(userId: Types.ObjectId, productId: Types.ObjectId): Promise<CartDTO> {
    await cartRepository.removeItem(userId, productId);
    return this.getCart(userId);
  }

  /**
   * Wipes the cart items.
   */
  async clearCart(userId: Types.ObjectId): Promise<CartDTO> {
    await cartRepository.clear(userId);
    return this.getCart(userId);
  }

  /**
   * Moves a wishlisted item to the cart using transaction session rules.
   */
  async moveFromWishlist(userId: Types.ObjectId, productId: Types.ObjectId): Promise<CartDTO> {
    const session = await mongoose.startSession();

    try {
      let cartResult: CartDTO | null = null;

      try {
        // Run updates atomically inside session transaction block if replica sets are active
        await session.withTransaction(async () => {
          cartResult = await this.addItem(userId, productId, 1);
          await wishlistRepository.removeItem(userId, productId);
        });
      } catch (txnError: unknown) {
        const err = txnError as Error & { code?: number };
        const isUnsupported =
          err.message?.includes('replica set') ||
          err.message?.includes('transaction') ||
          err.code === 20;

        if (isUnsupported) {
          // Fallback for standalone Mongo instances (local dev / testing environments)
          cartResult = await this.addItem(userId, productId, 1);
          await wishlistRepository.removeItem(userId, productId);
        } else {
          throw txnError;
        }
      }

      await session.endSession();
      return cartResult || this.getCart(userId);
    } catch (error: unknown) {
      await session.endSession();
      const err = error as Error;
      // Auto-wrap Mongo transaction failures with 409 Conflict
      throw new AppError(
        `Failed to move item from wishlist to cart: ${err.message}`,
        HTTP_STATUS.CONFLICT
      );
    }
  }
}

export const cartService = new CartService();
