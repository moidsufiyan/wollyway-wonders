import { z } from 'zod';

export const customerOrderQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export const customerCancelOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID or Order Number is required'),
  }),
  body: z.object({
    reason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional(),
  }),
});

export const adminOrderQuerySchema = z.object({
  query: z.object({
    status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    orderNumber: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const adminUpdateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']),
    carrier: z.string().max(50, 'Carrier name cannot exceed 50 characters').optional(),
    trackingNumber: z.string().max(100, 'Tracking number cannot exceed 100 characters').optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const adminCancelOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    reason: z.string().min(3, 'Cancellation reason must be at least 3 characters').max(500),
  }),
});
