import { Schema, model, Document, Types } from 'mongoose';
import {
  OrderStatus,
  OrderItemSnapshot,
  CustomerSnapshot,
  OrderAddressSnapshot,
  OrderFinancials,
  OrderPaymentInfo,
  OrderFulfillmentInfo,
  OrderCancellationInfo,
} from '../types/order.types.js';

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  checkoutSessionId: Types.ObjectId;
  customerSnapshot: CustomerSnapshot;
  shippingAddress: OrderAddressSnapshot;
  items: OrderItemSnapshot[];
  financials: OrderFinancials;
  paymentInfo: OrderPaymentInfo;
  status: OrderStatus;
  fulfillment?: OrderFulfillmentInfo;
  cancellation?: OrderCancellationInfo;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItemSnapshot>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required.'],
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required.'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug snapshot is required.'],
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Item unit price is required.'],
      min: [0, 'Item price cannot be negative.'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required.'],
      min: [1, 'Quantity must be at least 1.'],
    },
  },
  { _id: false }
);

const CustomerSnapshotSchema = new Schema<CustomerSnapshot>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderAddressSnapshotSchema = new Schema<OrderAddressSnapshot>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderFinancialsSchema = new Schema<OrderFinancials>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, min: 0 },
    orderTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
  },
  { _id: false }
);

const OrderPaymentInfoSchema = new Schema<OrderPaymentInfo>(
  {
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'refunded'],
      default: 'paid',
      required: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const OrderFulfillmentSchema = new Schema<OrderFulfillmentInfo>(
  {
    carrier: { type: String },
    trackingNumber: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { _id: false }
);

const OrderCancellationSchema = new Schema<OrderCancellationInfo>(
  {
    reason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required.'],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      index: true,
    },
    checkoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckoutSession',
      required: [true, 'Checkout session reference is required.'],
      unique: true,
      index: true,
    },
    customerSnapshot: {
      type: CustomerSnapshotSchema,
      required: [true, 'Customer snapshot is required.'],
    },
    shippingAddress: {
      type: OrderAddressSnapshotSchema,
      required: [true, 'Shipping address snapshot is required.'],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Order items are required.'],
      validate: {
        validator: (items: OrderItemSnapshot[]) => items.length > 0,
        message: 'Order must contain at least one item.',
      },
    },
    financials: {
      type: OrderFinancialsSchema,
      required: [true, 'Order financials are required.'],
    },
    paymentInfo: {
      type: OrderPaymentInfoSchema,
      required: [true, 'Payment information is required.'],
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
      default: 'CONFIRMED',
      required: true,
      index: true,
    },
    fulfillment: {
      type: OrderFulfillmentSchema,
      default: {},
    },
    cancellation: {
      type: OrderCancellationSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------------------------------
// Compound & Specialized Indexes
// --------------------------------------------------------------------------

// Customer order history (sorted newest first)
OrderSchema.index({ userId: 1, createdAt: -1 });

// Unique sparse index on payment gateway transaction ID for idempotency
OrderSchema.index({ 'paymentInfo.transactionId': 1 }, { unique: true, sparse: true });

// Admin status & date range filtering
OrderSchema.index({ status: 1, createdAt: -1 });

// Active product order verification (for product archival guard)
OrderSchema.index({ 'items.productId': 1, status: 1 });

export const Order = model<IOrder>('Order', OrderSchema);
