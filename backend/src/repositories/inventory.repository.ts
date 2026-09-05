/**
 * @file inventory.repository.ts
 * @description Repository abstraction for Inventory domain queries and transactional mutations.
 *
 * Domain Boundary Rule: External services (Product Discovery, Order, Checkout)
 * must never import the Inventory or InventoryTransaction models directly.
 * All inventory-related data access and atomic mutations flow through this repository.
 */

import { ClientSession, Types } from 'mongoose';
import { Inventory, IInventory } from '../models/inventory.model.js';
import { InventoryTransaction } from '../models/inventory-transaction.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

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
   * - trackInventory: true  -> Increments available, decrements sold.
   * - trackInventory: false -> Decrements sold only.
   * - Appends an InventoryTransaction audit log with reason: 'return'.
   */
  async restockProduct(
    productId: Types.ObjectId,
    quantity: number,
    orderId?: Types.ObjectId,
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
        { productId },
        {
          $inc: {
            available: quantity,
            sold: -quantity,
          },
        },
        { new: true, session }
      );
    } else {
      updatedInventory = await Inventory.findOneAndUpdate(
        { productId },
        {
          $inc: {
            sold: -quantity,
          },
        },
        { new: true, session }
      );
    }

    if (!updatedInventory) {
      throw new AppError(
        `Failed to restock inventory for product ${productId}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

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

    return updatedInventory;
  }
}

export const inventoryRepository = new InventoryRepository();
