/**
 * @file inventory.types.ts
 * @description Frontend TypeScript types and DTO contracts for Inventory domain.
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
  | 'all'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'not_tracked';

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

export interface AdminInventoryStockStateDTO {
  state: InventoryStockState;
  label: string; // "In stock" | "Low stock" | "Out of stock" | "Not tracked"
}

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

export interface AdminInventoryQueryParams {
  q?: string;
  status?: AdminInventoryStatusFilter;
  lowStock?: boolean;
  sort?: AdminInventorySortOption;
  page?: number;
  limit?: number;
}

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

export type InventoryTransactionReason = 'manual' | 'purchase' | 'return' | 'damage' | 'audit' | 'correction' | 'shrinkage';

export interface InventoryAdjustmentDTO {
  change: number;
  reason: InventoryTransactionReason;
  notes?: string;
}

export interface InventoryHistoryResultDTO {
  _id: string;
  inventoryId: string;
  reason: InventoryTransactionReason;
  quantity: number;
  before: number;
  after: number;
  notes: string | null;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface InventoryHistoryListResult {
  success: true;
  results: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  history: InventoryHistoryResultDTO[];
}
