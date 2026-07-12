import { Types } from 'mongoose';

export type CheckoutStatus =
  | 'CREATED'
  | 'VALIDATING'
  | 'READY'
  | 'RESERVED'
  | 'PAYMENT_PENDING'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'FAILED'
  | 'COMPLETED';

export type PaymentProvider = 'stripe' | 'razorpay' | 'cod';

export interface CheckoutItemSnapshot {
  productId: Types.ObjectId;
  quantity: number;
  price: number; // Stored in cents
  name: string;
  image: string;
  slug: string;
}

export interface CheckoutAddressSnapshot {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutTotalsDTO {
  subtotal: number;
  shippingFee: number;
  taxTotal: number;
  orderTotal: number;
}

export interface ValidationIssue {
  productId: string;
  reason: 'UNPUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'PRICE_CHANGED';
  details?: {
    snapshotPrice?: number;
    currentPrice?: number;
    availableStock?: number;
    requestedQuantity?: number;
  };
}

export interface CheckoutSummaryDTO {
  sessionId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
    isAvailable: boolean;
  }[];
  shippingAddressSnapshot: CheckoutAddressSnapshot | null;
  totals: CheckoutTotalsDTO;
  reservationExpiresAt: Date | null;
  status: CheckoutStatus;
  paymentProvider: PaymentProvider | null;
  paymentIntentId: string | null;
}
