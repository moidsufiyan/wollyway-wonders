/**
 * @file inventory.repository.ts
 * @description Repository abstraction for Inventory domain queries.
 *
 * Domain Boundary Rule: The Product Discovery service must never import the
 * Inventory model directly. All inventory-related data access flows through
 * this repository, keeping domain concerns separated.
 *
 * Future Path: When the catalog grows significantly, replace the
 * getProductIdsInStock() pre-fetch + $in filter pattern with a MongoDB
 * $lookup aggregation pipeline joining Inventory inline within the Product
 * Repository. This repository's interface remains unchanged — zero
 * service-layer changes required.
 */

import { Types } from 'mongoose';
import { Inventory } from '../models/inventory.model.js';

export class InventoryRepository {
  /**
   * Returns the productIds of all items currently in stock.
   * In-stock = available > 0 AND not discontinued.
   */
  async getProductIdsInStock(): Promise<Types.ObjectId[]> {
    const records = await Inventory.find(
      { available: { $gt: 0 }, isDiscontinued: false },
      { productId: 1, _id: 0 }
    ).lean();

    return records.map((r) => r.productId as Types.ObjectId);
  }

  /**
   * Returns the exact available quantity of a specific product.
   * Returns 0 if product is discontinued, not tracked, or not found.
   */
  async getAvailableStock(productId: Types.ObjectId): Promise<number> {
    const record = await Inventory.findOne({ productId }).lean();
    if (!record || record.isDiscontinued) return 0;
    if (!record.trackInventory) return 999; // Treat untracked as infinite stock (max bounds)
    return record.available;
  }

  /**
   * Batch resolves stock levels for a list of products.
   * Returns a map of productId (string) -> available stock (number).
   */
  async getBatchStock(productIds: Types.ObjectId[]): Promise<Map<string, number>> {
    const records = await Inventory.find({ productId: { $in: productIds } }).lean();
    const stockMap = new Map<string, number>();

    for (const record of records) {
      const key = (record.productId as Types.ObjectId).toString();
      const val = record.isDiscontinued ? 0 : record.trackInventory ? record.available : 999;
      stockMap.set(key, val);
    }
    return stockMap;
  }
}

export const inventoryRepository = new InventoryRepository();
