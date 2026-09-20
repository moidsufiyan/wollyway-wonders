import { z } from 'zod';
import type { AdminOrderSortOption, AdminPaymentStatus } from '../types/admin-order.types.js';
import type { OrderStatus } from '../types/order.types.js';

export const ADMIN_ORDER_SORT_OPTIONS: AdminOrderSortOption[] = [
  'created_desc',
  'created_asc',
  'total_desc',
  'total_asc',
  'orderNumber_asc',
  'orderNumber_desc',
];

export const ADMIN_ORDER_STATUS_FILTERS: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export const ADMIN_PAYMENT_STATUS_FILTERS: AdminPaymentStatus[] = ['paid', 'refunded'];

export const listAdminOrdersQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(1),
      limit: z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit cannot exceed 50')
        .default(20),
      q: z.string().trim().max(100, 'Search query cannot exceed 100 characters').optional(),
      status: z.enum(['all', ...ADMIN_ORDER_STATUS_FILTERS] as const).default('all'),
      paymentStatus: z.enum(['all', ...ADMIN_PAYMENT_STATUS_FILTERS] as const).default('all'),
      sort: z
        .enum(ADMIN_ORDER_SORT_OPTIONS as [AdminOrderSortOption, ...AdminOrderSortOption[]])
        .default('created_desc'),
      from: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), { message: "Invalid 'from' date format" })
        .optional(),
      to: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), { message: "Invalid 'to' date format" })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          return new Date(data.from).getTime() <= new Date(data.to).getTime();
        }
        return true;
      },
      {
        message: "'from' date cannot be strictly after 'to' date",
        path: ['from'],
      }
    ),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID format'),
  }),
});

export const updateAdminOrderStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED'], {
        errorMap: () => ({ message: 'Status must be PROCESSING, SHIPPED, or DELIVERED' }),
      }),
    })
    .strict('Only the status field is permitted'),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID format'),
  }),
});

export const cancelAdminOrderSchema = z.object({
  body: z
    .object({
      reason: z
        .string()
        .trim()
        .max(500, 'Cancellation reason cannot exceed 500 characters')
        .optional(),
    })
    .strict('Only the reason field is permitted'),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID format'),
  }),
});
