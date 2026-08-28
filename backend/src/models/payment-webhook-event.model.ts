import { Schema, model, Document } from 'mongoose';
import { PaymentProviderType } from '../types/payment.types.js';
import { PAYMENT_WEBHOOK_STATUS, PaymentWebhookStatus } from '../constants/index.js';

export interface IPaymentWebhookEvent extends Document {
  eventId: string;
  provider: PaymentProviderType;
  eventType: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  payloadSummary: Record<string, unknown>;
  status: PaymentWebhookStatus;
  errorMessage?: string;
  retryable: boolean;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
  {
    eventId: {
      type: String,
      required: [true, 'Webhook event ID is required.'],
      trim: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe'],
      required: [true, 'Payment provider is required.'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required.'],
      trim: true,
    },
    gatewayOrderId: {
      type: String,
      trim: true,
    },
    gatewayPaymentId: {
      type: String,
      trim: true,
    },
    payloadSummary: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_WEBHOOK_STATUS),
      default: PAYMENT_WEBHOOK_STATUS.RECEIVED,
      required: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    retryable: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 1. Enforce unique delivery of events per provider (Race-safe idempotency defense)
PaymentWebhookEventSchema.index({ eventId: 1, provider: 1 }, { unique: true });

// 2. Gateway Order ID lookup index
PaymentWebhookEventSchema.index({ gatewayOrderId: 1 }, { sparse: true });

// 3. Operational Housekeeping TTL Index (90 days retention)
PaymentWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const PaymentWebhookEvent = model<IPaymentWebhookEvent>(
  'PaymentWebhookEvent',
  PaymentWebhookEventSchema
);
