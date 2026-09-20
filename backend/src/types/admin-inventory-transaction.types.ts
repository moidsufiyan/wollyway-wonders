/**
 * @file admin-inventory-transaction.types.ts
 * @description TypeScript DTOs for the Admin Inventory Adjustments and History Domain.
 */

export type InventoryTransactionReason =
  'manual' | 'purchase' | 'return' | 'damage' | 'audit' | 'correction' | 'shrinkage';

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
