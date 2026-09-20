/**
 * @file admin-inventory.types.ts
 * @description TypeScript contracts for the Admin Inventory Domain.
 *
 * Exposes clean, typed DTOs for administrative inventory inspection
 * without leaking raw Redis internals or internal Mongoose models.
 */

export type InventoryStockState = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_TRACKED';

export type AdminInventorySortOption =
  | 'updated_desc'
  | 'updated_asc'
  | 'available_desc'
  | 'available_asc'
  | 'reserved_desc'
  | 'reserved_asc'
  | 'sold_desc'
  | 'sold_asc';

export type AdminInventoryStatusFilter =
  'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_tracked';

// ---------------------------------------------------------------------------
// Product Reference DTO
// ---------------------------------------------------------------------------

export interface AdminInventoryProductReferenceDTO {
  _id: string;
  name: string;
  slug: string;
  primaryImage: {
    url: string;
    alt: string;
  } | null;
  price?: number;
  visibility?: string;
}

// ---------------------------------------------------------------------------
// Stock State Descriptor DTO
// ---------------------------------------------------------------------------

export interface AdminInventoryStockStateDTO {
  state: InventoryStockState;
  label: string; // "In stock" | "Low stock" | "Out of stock" | "Not tracked"
}

// ---------------------------------------------------------------------------
// Admin Inventory Item DTO
// ---------------------------------------------------------------------------

export interface AdminInventoryItemDTO {
  _id: string;
  productId: string;
  product: AdminInventoryProductReferenceDTO | null;
  available: number;
  reserved: number;
  sold: number;
  trackInventory: boolean;
  lowStockThreshold: number;
  stockState: AdminInventoryStockStateDTO;
  isDiscontinued: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Query Params
// ---------------------------------------------------------------------------

export interface AdminInventoryQueryParams {
  q?: string;
  status?: AdminInventoryStatusFilter;
  lowStock?: boolean;
  sort?: AdminInventorySortOption;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Paginated Response Shape
// ---------------------------------------------------------------------------

export interface AdminInventoryListResult {
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
    status?: AdminInventoryStatusFilter;
    lowStock?: boolean;
  };
  sort: AdminInventorySortOption;
  inventory: AdminInventoryItemDTO[];
}
