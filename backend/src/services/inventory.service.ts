import mongoose, { Types } from 'mongoose';
import { Inventory, IInventory } from '../models/inventory.model.js';
import { InventoryTransaction } from '../models/inventory-transaction.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export class InventoryService {
  // Retrieve public masked inventory status for product display page
  public async getInventoryByProductId(productId: string): Promise<{ availability: string }> {
    const inventory = await Inventory.findOne({ productId: new Types.ObjectId(productId) });
    if (!inventory) {
      // Default fallback if inventory was not initialized yet
      return { availability: 'In Stock' };
    }

    if (inventory.isDiscontinued) {
      return { availability: 'Discontinued' };
    }

    if (!inventory.trackInventory) {
      return { availability: 'In Stock' };
    }

    if (inventory.available === 0) {
      return { availability: 'Out of Stock' };
    }

    if (inventory.available <= inventory.lowStockThreshold) {
      return { availability: `Only ${inventory.available} left` };
    }

    return { availability: 'In Stock' };
  }

  // Retrieve exact details for admin analytics
  public async getAdminInventoryByProductId(productId: string): Promise<IInventory> {
    const inventory = await Inventory.findOne({ productId: new Types.ObjectId(productId) });
    if (!inventory) {
      throw new AppError('Inventory record not found for this product.', HTTP_STATUS.NOT_FOUND);
    }
    return inventory;
  }

  // Atomically adjust available stock pool and write log history
  public async adjustInventory(
    productId: string,
    change: number,
    reason: 'manual' | 'purchase' | 'return' | 'damage' | 'audit' | 'correction' | 'shrinkage',
    notes?: string | null,
    adminUserId?: string
  ): Promise<IInventory> {
    // 1. Verify parent product exists in collection directly
    const productExists = await mongoose.connection.db
      ?.collection('products')
      ?.findOne({ _id: new Types.ObjectId(productId) });

    if (!productExists) {
      throw new AppError('Parent Product does not exist.', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Fetch or initialize inventory record
    let inventory = await Inventory.findOne({ productId: new Types.ObjectId(productId) });
    if (!inventory) {
      inventory = new Inventory({
        productId: new Types.ObjectId(productId),
        available: 0,
        reserved: 0,
        sold: 0,
      });
    }

    // 3. Prevent updates on discontinued items
    if (inventory.isDiscontinued) {
      throw new AppError(
        'Discontinued products cannot receive stock adjustments.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 4. Calculate pools
    const before = inventory.available;
    const after = before + change;

    if (after < 0) {
      throw new AppError(
        `Insufficient stock. Available stock cannot drop below zero (requested change: ${change}, current stock: ${before}).`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 5. Update and save inventory
    inventory.available = after;
    await inventory.save();

    // 6. Write append-only audit trail
    const transaction = new InventoryTransaction({
      inventoryId: inventory._id,
      reason,
      quantity: change,
      before,
      after,
      notes: notes || null,
      createdBy: adminUserId ? new Types.ObjectId(adminUserId) : null,
    });
    await transaction.save();

    return inventory;
  }

  // Adjust warning limits or tracking bypasses
  public async updateSettings(
    productId: string,
    settings: { lowStockThreshold?: number; trackInventory?: boolean },
    adminUserId?: string
  ): Promise<IInventory> {
    const productExists = await mongoose.connection.db
      ?.collection('products')
      ?.findOne({ _id: new Types.ObjectId(productId) });

    if (!productExists) {
      throw new AppError('Parent Product does not exist.', HTTP_STATUS.NOT_FOUND);
    }

    let inventory = await Inventory.findOne({ productId: new Types.ObjectId(productId) });
    if (!inventory) {
      inventory = new Inventory({
        productId: new Types.ObjectId(productId),
        available: 0,
        reserved: 0,
        sold: 0,
      });
    }

    if (settings.lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = settings.lowStockThreshold;
    }
    if (settings.trackInventory !== undefined) {
      inventory.trackInventory = settings.trackInventory;
    }

    await inventory.save();

    // Optional: Log adjustment under 'manual' configuration audits
    const transaction = new InventoryTransaction({
      inventoryId: inventory._id,
      reason: 'manual',
      quantity: 0,
      before: inventory.available,
      after: inventory.available,
      notes: `Updated settings: threshold=${settings.lowStockThreshold}, track=${settings.trackInventory}`,
      createdBy: adminUserId ? new Types.ObjectId(adminUserId) : null,
    });
    await transaction.save();

    return inventory;
  }
}

export const inventoryService = new InventoryService();
