import { Schema, model, Document, Types } from 'mongoose';
import { CartItemModel } from '../types/cart.types.js';

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: CartItemModel[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItemModel>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required.'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required.'],
      min: [1, 'Quantity must be at least 1.'],
    },
    priceSnapshot: {
      type: Number,
      required: [true, 'Price snapshot is required.'],
      min: [0, 'Price snapshot cannot be negative.'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes

CartSchema.index({ userId: 1, 'items.productId': 1 });

export const Cart = model<ICart>('Cart', CartSchema);
