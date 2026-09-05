import { Types, ClientSession } from 'mongoose';
import { Wishlist, IWishlist } from '../models/wishlist.model.js';

export class WishlistRepository {
  /**
   * Find a user's wishlist document.
   */
  async findByUserId(userId: Types.ObjectId): Promise<IWishlist | null> {
    return Wishlist.findOne({ userId });
  }

  /**
   * Adds an item atomically if it doesn't already exist in the user's items list.
   * Returns the updated Wishlist document.
   */
  async addItem(userId: Types.ObjectId, productId: Types.ObjectId): Promise<IWishlist> {
    await Wishlist.updateOne({ userId }, { $setOnInsert: { items: [] } }, { upsert: true });

    const updated = await Wishlist.findOneAndUpdate(
      { userId, 'items.productId': { $ne: productId } },
      {
        $push: {
          items: { productId, addedAt: new Date() },
        },
      },
      { new: true }
    );

    if (updated) {
      return updated;
    }

    return (await Wishlist.findOne({ userId })) as IWishlist;
  }

  /**
   * Removes an item atomically.
   * Returns the updated Wishlist document.
   */
  async removeItem(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { userId },
      {
        $pull: {
          items: { productId },
        },
      },
      { new: true, session }
    );
  }

  /**
   * Clears all items in the user's wishlist.
   */
  async clear(userId: Types.ObjectId): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { userId },
      {
        $set: { items: [] },
      },
      { new: true }
    );
  }

  /**
   * Checks if an item exists inside a user's wishlist.
   */
  async exists(userId: Types.ObjectId, productId: Types.ObjectId): Promise<boolean> {
    const doc = await Wishlist.findOne({
      userId,
      'items.productId': productId,
    });
    return !!doc;
  }
}

export const wishlistRepository = new WishlistRepository();
