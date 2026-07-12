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
   *
   * The result is used by the Discovery service to add an
   * { _id: { $in: [...] } } filter to the product query.
   */
  async getProductIdsInStock(): Promise<Types.ObjectId[]> {
    const records = await Inventory.find(
      { available: { $gt: 0 }, isDiscontinued: false },
      { productId: 1, _id: 0 } // projection: only fetch productId
    ).lean();

    return records.map((r) => r.productId as Types.ObjectId);
  }
}

export const inventoryRepository = new InventoryRepository();
