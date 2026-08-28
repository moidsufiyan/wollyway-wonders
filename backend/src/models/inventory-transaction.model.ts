import { Schema, model, Document, Types } from 'mongoose';

export interface IInventoryTransaction extends Document {
  inventoryId: Types.ObjectId;
  reason: 'manual' | 'purchase' | 'return' | 'damage' | 'audit' | 'correction' | 'shrinkage';
  quantity: number;
  before: number;
  after: number;
  orderId?: Types.ObjectId | null;
  checkoutSessionId?: Types.ObjectId | null;
  notes: string | null;
  createdBy: Types.ObjectId | null;
  createdAt: Date;
}

const CategoryInventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Inventory ID reference is required.'],
      index: true,
    },
    reason: {
      type: String,
      enum: ['manual', 'purchase', 'return', 'damage', 'audit', 'correction', 'shrinkage'],
      required: [true, 'Transaction reason is required.'],
    },
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity change is required.'],
    },
    before: {
      type: Number,
      required: [true, 'Previous stock count is required.'],
    },
    after: {
      type: Number,
      required: [true, 'Target stock count is required.'],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    checkoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckoutSession',
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // Append-only, never updated
    },
  }
);

export const InventoryTransaction = model<IInventoryTransaction>(
  'InventoryTransaction',
  CategoryInventoryTransactionSchema
);
