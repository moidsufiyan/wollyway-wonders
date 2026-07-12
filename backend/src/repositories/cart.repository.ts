import { Types } from 'mongoose';
import { Cart, ICart } from '../models/cart.model.js';
import { CartItemModel } from '../types/cart.types.js';

export class CartRepository {
  /**
   * Find a user's cart.
   */
  async findByUserId(userId: Types.ObjectId): Promise<ICart | null> {
    return Cart.findOne({ userId });
  }

  /**
   * Atomically find or create the user's cart in a single round-trip.
   */
  async upsertCart(userId: Types.ObjectId): Promise<ICart> {
    return Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { new: true, upsert: true }
    );
  }

  /**
   * Appends an item atomically to the cart.
   */
  async addItem(userId: Types.ObjectId, item: CartItemModel): Promise<ICart | null> {
    return Cart.findOneAndUpdate({ userId }, { $push: { items: item } }, { new: true });
  }

  /**
   * Updates an item's quantity atomically using positional filters.
   */
  async updateQuantity(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    quantity: number
  ): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  }

  /**
   * Removes an item from the cart.
   */
  async removeItem(userId: Types.ObjectId, productId: Types.ObjectId): Promise<ICart | null> {
    return Cart.findOneAndUpdate({ userId }, { $pull: { items: { productId } } }, { new: true });
  }

  /**
   * Wipes all items in the cart.
   */
  async clear(userId: Types.ObjectId): Promise<ICart | null> {
    return Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true });
  }
}

export const cartRepository = new CartRepository();
