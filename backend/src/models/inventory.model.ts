import { Schema, model, Document, Types } from 'mongoose';

export interface IInventory extends Document {
  productId: Types.ObjectId;
  available: number;
  reserved: number;
  sold: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isDiscontinued: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID reference is required.'],
      unique: true,
      index: true,
    },
    available: {
      type: Number,
      required: [true, 'Available quantity is required.'],
      min: [0, 'Available stock cannot be negative.'],
      default: 0,
    },
    reserved: {
      type: Number,
      required: [true, 'Reserved quantity is required.'],
      min: [0, 'Reserved stock cannot be negative.'],
      default: 0,
    },
    sold: {
      type: Number,
      required: [true, 'Sold quantity is required.'],
      min: [0, 'Sold stock cannot be negative.'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: [true, 'Low stock threshold is required.'],
      min: [0, 'Low stock threshold cannot be negative.'],
      default: 5,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    isDiscontinued: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimization of status checking queries
InventorySchema.index({ available: 1, isDiscontinued: 1 });

export const Inventory = model<IInventory>('Inventory', InventorySchema);
