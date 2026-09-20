/**
 * @file admin-order.types.ts
 * @description TypeScript contracts for the Admin Order Listing domain.
 *
 * Exposes safe, typed DTOs for administrative order overview without leaking
 * internal Mongoose properties, raw payment tokens, or passwords.
 */

import type { OrderStatus } from './order.types.js';

export type AdminPaymentStatus = 'paid' | 'refunded';

export interface AdminOrderStatusUpdateDTO {
  status: OrderStatus;
}

export type AdminOrderSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'total_desc'
  | 'total_asc'
  | 'orderNumber_asc'
  | 'orderNumber_desc';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface AdminOrderCustomerDTO {
  id: string;
  displayName: string;
  name: string;
  email: string;
}

export interface AdminOrderSummaryDTO {
  id: string;
  orderNumber: string;
  customer: AdminOrderCustomerDTO;
  status: OrderStatus;
  paymentStatus: AdminPaymentStatus;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Detail DTOs
// ---------------------------------------------------------------------------

export interface AdminOrderCustomerDetailDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AdminOrderShippingSnapshotDTO {
  recipientName: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AdminOrderItemDetailDTO {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderFinancialsDTO {
  subtotal: number;
  shippingFee: number;
  taxTotal: number;
  orderTotal: number;
  currency: string;
}

export interface AdminOrderPaymentDetailDTO {
  method: string;
  status: AdminPaymentStatus;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundId?: string;
  refundAmount?: number;
}

export interface AdminOrderLifecycleDTO {
  status: OrderStatus;
  paymentStatus: AdminPaymentStatus;
  createdAt: string;
  updatedAt: string;
  fulfillment?: {
    carrier?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  cancellation?: {
    reason?: string;
    cancelledAt?: string;
    cancelledBy?: string;
  };
}

export interface AdminOrderDetailDTO {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus: AdminPaymentStatus;
  customer: AdminOrderCustomerDetailDTO;
  shipping: AdminOrderShippingSnapshotDTO;
  items: AdminOrderItemDetailDTO[];
  financials: AdminOrderFinancialsDTO;
  payment: AdminOrderPaymentDetailDTO;
  lifecycle: AdminOrderLifecycleDTO;
  fulfillment?: AdminOrderLifecycleDTO['fulfillment'];
  cancellation?: AdminOrderLifecycleDTO['cancellation'];
  history: {
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    changedAt: string;
    changedBy: string;
  }[];
}

// ---------------------------------------------------------------------------
// Query Params & Paginated Result
// ---------------------------------------------------------------------------

export interface PaginatedAdminOrdersDTO {
  orders: AdminOrderDetailDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: OrderStatus | 'all';
  paymentStatus?: AdminPaymentStatus | 'all';
  sort?: AdminOrderSortOption;
  from?: string; // ISO 8601 string
  to?: string; // ISO 8601 string
}

export interface AdminOrderListResult {
  success: true;
  results: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  filters: {
    q?: string;
    status?: OrderStatus | 'all';
    paymentStatus?: AdminPaymentStatus | 'all';
    from?: string;
    to?: string;
  };
  sort: AdminOrderSortOption;
  orders: AdminOrderSummaryDTO[];
}
