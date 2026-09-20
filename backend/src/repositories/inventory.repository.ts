/**
 * @file inventory.repository.ts
 * @description Repository abstraction for Inventory domain queries and transactional mutations.
 *
 * Domain Boundary Rule: External services (Product Discovery, Order, Checkout)
 * must never import the Inventory or InventoryTransaction models directly.
 * All inventory-related data access and atomic mutations flow through this repository.
 */

import { ClientSession, Types, FilterQuery } from 'mongoose';
import { Inventory, IInventory } from '../models/inventory.model.js';
import {
  InventoryTransaction,
  IInventoryTransaction,
} from '../models/inventory-transaction.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import { InventoryTransactionReason } from '../types/admin-inventory-transaction.types.js';

export class InventoryRepository {
  /**
   * Returns the productIds of all items currently in stock.
   * In-stock = available > 0 AND not discontinued.
   */
  async getProductIdsInStock(): Promise<Types.ObjectId[]> {
    const records = await Inventory.find(
      {
        $or: [{ available: { $gt: 0 } }, { trackInventory: false }],
        isDiscontinued: false,
      },
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

  /**
   * Atomically commits inventory deduction during Order creation.
   *
   * Invariants:
   * - trackInventory: true  -> Checks available >= quantity, decrements available, increments sold.
   * - trackInventory: false -> Does NOT decrement available, increments sold only.
   * - Appends an InventoryTransaction audit log with reason: 'purchase'.
   */
  async deductStock(
    productId: Types.ObjectId,
    quantity: number,
    orderId?: Types.ObjectId,
    checkoutSessionId?: Types.ObjectId,
    session?: ClientSession
  ): Promise<IInventory> {
    const currentInv = await Inventory.findOne({ productId }).session(session || null);
    if (!currentInv) {
      throw new AppError(
        `Inventory record not found for product ${productId}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (currentInv.isDiscontinued) {
      throw new AppError(`Cannot purchase discontinued product ${productId}`, HTTP_STATUS.CONFLICT);
    }

    let updatedInventory: IInventory | null;

    if (currentInv.trackInventory) {
      updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId,
          isDiscontinued: false,
          available: { $gte: quantity },
        },
        {
          $inc: {
            available: -quantity,
            sold: quantity,
          },
        },
        { new: true, session }
      );
    } else {
      updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId,
          isDiscontinued: false,
        },
        {
          $inc: {
            sold: quantity,
          },
        },
        { new: true, session }
      );
    }

    if (!updatedInventory) {
      throw new AppError(
        `Insufficient available inventory to fulfill order line for product ${productId}`,
        HTTP_STATUS.CONFLICT
      );
    }

    await InventoryTransaction.create(
      [
        {
          inventoryId: updatedInventory._id,
          reason: 'purchase',
          quantity: currentInv.trackInventory ? -quantity : 0,
          before: currentInv.available,
          after: updatedInventory.available,
          orderId: orderId || null,
          checkoutSessionId: checkoutSessionId || null,
          notes: `Order fulfillment stock deduction`,
        },
      ],
      { session }
    );

    return updatedInventory;
  }

  /**
   * Atomically restores inventory upon Order cancellation or refund.
   *
   * Invariants:
   * - One order + one inventory item + return = one inventory restoration transaction.
   * - trackInventory: true  -> Increments available, decrements sold (if decrementSold is true).
   * - trackInventory: false -> Decrements sold only (if decrementSold is true).
   * - Appends an InventoryTransaction audit log with reason: 'return'.
   * - Concurrency-safe against race conditions via partial unique index.
   */
  async restockProduct(
    productId: Types.ObjectId,
    quantity: number,
    orderId?: Types.ObjectId,
    session?: ClientSession,
    decrementSold: boolean = true
  ): Promise<IInventory> {
    const currentInv = await Inventory.findOne({ productId }).session(session || null);
    if (!currentInv) {
      throw new AppError(
        `Inventory record not found for product ${productId}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Idempotency check: verify if this order item was already restocked
    if (orderId) {
      const existingTx = await InventoryTransaction.findOne({
        orderId,
        inventoryId: currentInv._id,
        reason: 'return',
      }).session(session || null);

      if (existingTx) {
        logger.info(
          { orderId: orderId.toString(), productId: productId.toString() },
          'Inventory already restocked for order line-item; skipping duplicate restoration'
        );
        return currentInv;
      }
    }

    const incFields: Record<string, number> = {};
    if (currentInv.trackInventory) {
      incFields.available = quantity;
    }
    if (decrementSold) {
      incFields.sold = -quantity;
    }

    let updatedInventory: IInventory | null = currentInv;

    if (Object.keys(incFields).length > 0) {
      updatedInventory = await Inventory.findOneAndUpdate(
        { productId },
        { $inc: incFields },
        { new: true, session }
      );

      if (!updatedInventory) {
        throw new AppError(
          `Failed to restock inventory for product ${productId}`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    try {
      await InventoryTransaction.create(
        [
          {
            inventoryId: updatedInventory._id,
            reason: 'return',
            quantity: currentInv.trackInventory ? quantity : 0,
            before: currentInv.available,
            after: updatedInventory.available,
            orderId: orderId || null,
            notes: `Order cancellation/refund restocking`,
          },
        ],
        { session }
      );
    } catch (err: unknown) {
      const anyErr = err as Record<string, unknown>;
      // If a concurrent thread already inserted the return record, treat as idempotent success
      if (anyErr?.code === 11000) {
        logger.warn(
          { orderId: orderId?.toString(), productId: productId.toString() },
          'Concurrent inventory restoration detected; idempotently skipped duplicate insert'
        );
        return currentInv;
      }
      throw err;
    }

    return updatedInventory;
  }

  /**
   * Queries paginated inventory records with populated product reference.
   */
  async findAdminInventory(
    filter: FilterQuery<IInventory>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number
  ): Promise<IInventory[]> {
    return Inventory.find(filter)
      .populate('productId', 'name slug images price visibility')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Counts inventory records matching filter.
   */
  async countAdminInventory(filter: FilterQuery<IInventory>): Promise<number> {
    return Inventory.countDocuments(filter);
  }

  /**
   * Atomically adjusts stock and logs an append-only transaction.
   * Assumes the caller has already acquired the per-product Redis lock
   * and verified that resulting stock will be valid (e.g. >= active reservations).
   */
  async adjustStock(
    productId: Types.ObjectId,
    change: number,
    reason: InventoryTransactionReason,
    notes: string | null,
    adminUserId: Types.ObjectId | null,
    session?: ClientSession
  ): Promise<IInventory> {
    const currentInv = await Inventory.findOne({ productId }).session(session || null);
    if (!currentInv) {
      throw new AppError(
        `Inventory record not found for product ${productId}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    let updatedInventory: IInventory | null;

    if (currentInv.trackInventory) {
      updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId,
          isDiscontinued: false,
          available: change < 0 ? { $gte: Math.abs(change) } : { $gte: 0 },
        },
        { $inc: { available: change } },
        { new: true, session: session || null }
      );
    } else {
      // For untracked inventory, do not adjust 'available' count, but we still log it.
      // Wait, instruction says: "trackInventory=false must follow existing domain semantics; do not manufacture stock accounting for untracked products."
      // Since it's untracked, we just return currentInv, but do we log the transaction?
      // Actually, if it's untracked, adjustInventory should probably be rejected or just logged with 0 change.
      // The service will handle this, but repository can do $inc on available too if we want, but wait, usually untracked doesn't change available.
      // Let's just update nothing but still return the doc.
      updatedInventory = currentInv;
    }

    if (!updatedInventory) {
      throw new AppError(
        'Failed to update inventory. Insufficient stock or concurrent modification.',
        HTTP_STATUS.CONFLICT
      );
    }

    await InventoryTransaction.create(
      [
        {
          inventoryId: updatedInventory._id,
          reason,
          quantity: currentInv.trackInventory ? change : 0,
          before: currentInv.available,
          after: updatedInventory.available,
          notes,
          createdBy: adminUserId,
        },
      ],
      { session: session || null }
    );

    return updatedInventory;
  }

  /**
   * Fetches paginated inventory transaction history for a product.
   */
  async getInventoryHistory(
    productId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<IInventoryTransaction[]> {
    const inventory = await Inventory.findOne({ productId }).lean();
    if (!inventory) {
      return [];
    }

    return InventoryTransaction.find({ inventoryId: inventory._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);
  }

  /**
   * Counts inventory transactions for a product.
   */
  async countInventoryHistory(productId: Types.ObjectId): Promise<number> {
    const inventory = await Inventory.findOne({ productId }).lean();
    if (!inventory) return 0;

    return InventoryTransaction.countDocuments({ inventoryId: inventory._id });
  }
}

export const inventoryRepository = new InventoryRepository();
