import { Schema, model, Document, Types } from 'mongoose';
import { WishlistItemDTO } from '../types/wishlist.types.js';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: WishlistItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<WishlistItemDTO>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required.'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      unique: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure unique wishlists per user


export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
