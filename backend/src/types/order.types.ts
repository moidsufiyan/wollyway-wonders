import { Types } from 'mongoose';
import { OrderStatus } from '../constants/index.js';

export type { OrderStatus };

export type OrderPaymentProvider = 'stripe' | 'razorpay';

export interface OrderItemSnapshot {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CustomerSnapshot {
  name: string;
  email: string;
  phone: string;
}

export interface OrderAddressSnapshot {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderFinancials {
  subtotal: number;
  shippingFee: number;
  taxTotal: number;
  orderTotal: number;
  currency: string;
}

export type OrderRefundStatus = 'not_started' | 'pending' | 'completed' | 'unknown';

export interface OrderPaymentInfo {
  provider: OrderPaymentProvider;
  transactionId: string;
  status: 'paid' | 'refunded';
  paidAt: Date;
  refundStatus?: OrderRefundStatus;
  refundId?: string;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface OrderFulfillmentInfo {
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderCancellationInfo {
  reason?: string;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
}

export interface OrderHistoryEntry {
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: Date;
  changedBy: Types.ObjectId;
}

export interface PaymentConfirmationPayload {
  provider: OrderPaymentProvider;
  transactionId: string;
  amount: number;
  currency: string;
  paidAt: Date;
}

// --------------------------------------------------------------------------
// DTOs
// --------------------------------------------------------------------------

export interface OrderItemDTO {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  itemCount: number;
  itemsPreview: {
    name: string;
    image: string;
    quantity: number;
  }[];
  orderTotal: number;
  currency: string;
  createdAt: Date;
}

export interface OrderDetailDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemDTO[];
  shippingAddress: OrderAddressSnapshot;
  financials: OrderFinancials;
  paymentInfo: {
    provider: OrderPaymentProvider;
    status: 'paid' | 'refunded';
    paidAt: Date;
  };
  fulfillment: OrderFulfillmentInfo;
  createdAt: Date;
}

// Added PaginatedOrdersDTO back
export interface PaginatedOrdersDTO {
  orders: OrderSummaryDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
// --------------------------------------------------------------------------
// Query & Payload Interfaces
// --------------------------------------------------------------------------

export interface AdminOrderFilterQuery {
  status?: OrderStatus;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminStatusUpdatePayload {
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
}
