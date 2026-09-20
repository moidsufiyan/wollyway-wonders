import { z } from 'zod';
import type {
  AdminInventorySortOption,
  AdminInventoryStatusFilter,
} from '../types/admin-inventory.types.js';

export const ADMIN_INVENTORY_SORT_OPTIONS: AdminInventorySortOption[] = [
  'updated_desc',
  'updated_asc',
  'available_desc',
  'available_asc',
  'reserved_desc',
  'reserved_asc',
  'sold_desc',
  'sold_asc',
];

export const ADMIN_INVENTORY_STATUS_FILTERS: AdminInventoryStatusFilter[] = [
  'all',
  'in_stock',
  'low_stock',
  'out_of_stock',
  'not_tracked',
];

export const listAdminInventoryQuerySchema = z.object({
  query: z.object({
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
    q: z.string().max(100, 'Search query cannot exceed 100 characters').optional(),
    status: z
      .enum(
        ADMIN_INVENTORY_STATUS_FILTERS as [
          AdminInventoryStatusFilter,
          ...AdminInventoryStatusFilter[],
        ]
      )
      .default('all'),
    lowStock: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      })
      .pipe(z.boolean().optional()),
    sort: z
      .enum(
        ADMIN_INVENTORY_SORT_OPTIONS as [AdminInventorySortOption, ...AdminInventorySortOption[]]
      )
      .default('updated_desc'),
  }),
});

export const ADMIN_INVENTORY_TRANSACTION_REASONS = [
  'manual',
  'purchase',
  'return',
  'damage',
  'audit',
  'correction',
  'shrinkage',
] as const;

export const inventoryAdjustmentSchema = z.object({
  body: z.object({
    change: z
      .number()
      .int('Change must be an integer')
      .refine((val) => val !== 0, {
        message: 'Change must not be zero',
      }),
    reason: z.enum(ADMIN_INVENTORY_TRANSACTION_REASONS),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
  }),
});

export const inventoryHistoryQuerySchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.coerce
      .number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(20),
  }),
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
  }),
});
