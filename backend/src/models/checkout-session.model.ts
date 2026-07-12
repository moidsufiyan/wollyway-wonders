import { Schema, model, Document, Types } from 'mongoose';
import {
  CheckoutStatus,
  PaymentProvider,
  CheckoutItemSnapshot,
  CheckoutAddressSnapshot,
} from '../types/checkout.types.js';

export interface ICheckoutSession extends Document {
  userId: Types.ObjectId;
  cartId: Types.ObjectId;
  status: CheckoutStatus;
  reservationId: string | null;
  reservationExpiresAt: Date | null;
  validatedAt: Date | null;
  cartSnapshot: {
    items: CheckoutItemSnapshot[];
  };
  shippingAddressSnapshot: CheckoutAddressSnapshot | null;
  idempotencyKey: string;
  paymentProvider: PaymentProvider | null;
  paymentIntentId: string | null;
  extensionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CheckoutItemSnapshotSchema = new Schema<CheckoutItemSnapshot>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const CheckoutAddressSnapshotSchema = new Schema<CheckoutAddressSnapshot>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const CheckoutSessionSchema = new Schema<ICheckoutSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: [true, 'Cart reference is required.'],
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'VALIDATING',
        'READY',
        'PAYMENT_PENDING',
        'EXPIRED',
        'CANCELLED',
        'FAILED',
        'COMPLETED',
      ],
      default: 'CREATED',
    },
    reservationId: { type: String, default: null },
    reservationExpiresAt: { type: Date, default: null },
    validatedAt: { type: Date, default: null },
    cartSnapshot: {
      items: { type: [CheckoutItemSnapshotSchema], default: [] },
    },
    shippingAddressSnapshot: { type: CheckoutAddressSnapshotSchema, default: null },
    idempotencyKey: { type: String, required: true },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay', 'cod'], default: null },
    paymentIntentId: { type: String, default: null },
    extensionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
CheckoutSessionSchema.index({ userId: 1, status: 1 });

// TTL Index to expire sessions automatically after 15 minutes (900 seconds)
CheckoutSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

export const CheckoutSession = model<ICheckoutSession>('CheckoutSession', CheckoutSessionSchema);
