import mongoose, { Types, FilterQuery } from 'mongoose';
import { Inventory, IInventory } from '../models/inventory.model.js';
import { InventoryTransaction } from '../models/inventory-transaction.model.js';
import { Product, IProduct } from '../models/product.model.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { checkoutService } from './checkout.service.js';
import { getRedisClient } from '../config/redis.config.js';
import { ParsedQs } from 'qs';
import type {
  AdminInventoryItemDTO,
  AdminInventoryListResult,
  AdminInventoryQueryParams,
  AdminInventorySortOption,
  AdminInventoryStockStateDTO,
  AdminInventoryProductReferenceDTO,
} from '../types/admin-inventory.types.js';
import type {
  InventoryHistoryListResult,
  InventoryTransactionReason,
  InventoryHistoryResultDTO,
} from '../types/admin-inventory-transaction.types.js';
import {
  listAdminInventoryQuerySchema,
  inventoryHistoryQuerySchema,
} from '../validators/admin-inventory.validator.js';
import crypto from 'crypto';

const ADMIN_INVENTORY_SORT_MAP: Record<AdminInventorySortOption, Record<string, 1 | -1>> = {
  updated_desc: { updatedAt: -1, _id: -1 },
  updated_asc: { updatedAt: 1, _id: 1 },
  available_desc: { available: -1, _id: -1 },
  available_asc: { available: 1, _id: 1 },
  reserved_desc: { reserved: -1, _id: -1 },
  reserved_asc: { reserved: 1, _id: 1 },
  sold_desc: { sold: -1, _id: -1 },
  sold_asc: { sold: 1, _id: 1 },
};

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

  /**
   * Lists inventory records for the administrative overview.
   * Supports search by product name/identifier, low-stock/status filtering,
   * deterministic sorting, pagination, and real-time Redis reservation discovery.
   */
  public async listAdminInventory(rawQuery: ParsedQs): Promise<AdminInventoryListResult> {
    // 1. Validate query parameters
    const parseResult = listAdminInventoryQuerySchema.shape.query.safeParse(rawQuery);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new AppError(
        firstIssue?.message ?? 'Invalid inventory query parameters',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const params = parseResult.data as AdminInventoryQueryParams & {
      sort: AdminInventorySortOption;
      page: number;
      limit: number;
    };

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const sort = ADMIN_INVENTORY_SORT_MAP[params.sort ?? 'updated_desc'];

    // 2. Build MongoDB query filter
    const filter: FilterQuery<IInventory> = {};

    // Product search (name, slug, or valid ObjectId)
    if (params.q) {
      const trimmed = params.q.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const productQuery: FilterQuery<IProduct> = {
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { slug: { $regex: escaped, $options: 'i' } },
        ],
      };
      if (Types.ObjectId.isValid(trimmed)) {
        productQuery.$or!.push({ _id: new Types.ObjectId(trimmed) });
      }

      const matchedProducts = await Product.find(productQuery, { _id: 1 }).lean();
      const productIds = matchedProducts.map((p) => p._id as Types.ObjectId);

      // If search query matched no products, return empty result immediately
      if (productIds.length === 0) {
        return {
          success: true,
          results: 0,
          pagination: {
            page,
            limit,
            totalPages: 0,
            totalItems: 0,
          },
          filters: {
            q: params.q,
            status: params.status,
            lowStock: params.lowStock,
          },
          sort: params.sort,
          inventory: [],
        };
      }

      filter.productId = { $in: productIds };
    }

    // Status and Low-Stock filters
    if (params.status === 'out_of_stock') {
      filter.trackInventory = true;
      filter.available = 0;
    } else if (params.status === 'low_stock' || params.lowStock === true) {
      filter.trackInventory = true;
      filter.available = { $gt: 0 };
      filter.$expr = { $lte: ['$available', '$lowStockThreshold'] };
    } else if (params.status === 'in_stock') {
      filter.$or = [
        { trackInventory: false },
        {
          trackInventory: true,
          $expr: { $gt: ['$available', '$lowStockThreshold'] },
        },
      ];
    } else if (params.status === 'not_tracked') {
      filter.trackInventory = false;
    }

    // 3. Execute paginated query and count in parallel
    const [rawItems, totalItems] = await Promise.all([
      inventoryRepository.findAdminInventory(filter, sort, skip, limit),
      inventoryRepository.countAdminInventory(filter),
    ]);

    // 4. Resolve active Redis reservations for items on this page
    let redis: ReturnType<typeof getRedisClient> | null = null;
    try {
      redis = getRedisClient();
    } catch {
      redis = null;
    }

    const reservedQuantities = await Promise.all(
      rawItems.map(async (item) => {
        const prodId =
          (item.productId as unknown as { _id?: Types.ObjectId })?._id?.toString() ||
          (item.productId ? item.productId.toString() : '');
        if (!prodId || !redis) {
          return item.reserved ?? 0;
        }
        try {
          const activeReserved = await checkoutService.getActiveReservedQuantity(redis, prodId);
          return Math.max(item.reserved ?? 0, activeReserved);
        } catch {
          return item.reserved ?? 0;
        }
      })
    );

    // 5. Transform raw items into clean DTOs
    const items: AdminInventoryItemDTO[] = rawItems.map((item, idx) => {
      const prodDoc = item.productId as unknown as IProduct | null;
      const isPopulatedProduct = prodDoc && typeof prodDoc === 'object' && 'name' in prodDoc;

      const productRef: AdminInventoryProductReferenceDTO | null = isPopulatedProduct
        ? {
            _id: (prodDoc as unknown as { _id: Types.ObjectId })._id.toString(),
            name: prodDoc.name,
            slug: prodDoc.slug,
            primaryImage: prodDoc.images?.find((img) => img.isPrimary)
              ? {
                  url: prodDoc.images.find((img) => img.isPrimary)!.url,
                  alt: prodDoc.images.find((img) => img.isPrimary)!.alt || prodDoc.name,
                }
              : prodDoc.images?.[0]
                ? {
                    url: prodDoc.images[0].url,
                    alt: prodDoc.images[0].alt || prodDoc.name,
                  }
                : null,
            price: prodDoc.price,
            visibility: prodDoc.visibility,
          }
        : null;

      const resolvedReserved = reservedQuantities[idx];

      // Stock State derivation using established lowStockThreshold
      let stockState: AdminInventoryStockStateDTO;
      if (!item.trackInventory) {
        stockState = { state: 'NOT_TRACKED', label: 'Not tracked' };
      } else if (item.available <= 0) {
        stockState = { state: 'OUT_OF_STOCK', label: 'Out of stock' };
      } else if (item.available <= item.lowStockThreshold) {
        stockState = { state: 'LOW_STOCK', label: 'Low stock' };
      } else {
        stockState = { state: 'IN_STOCK', label: 'In stock' };
      }

      const resolvedProductId = isPopulatedProduct
        ? (prodDoc as unknown as { _id: Types.ObjectId })._id.toString()
        : item.productId
          ? item.productId.toString()
          : '';

      return {
        _id: (item as unknown as { _id: Types.ObjectId })._id.toString(),
        productId: resolvedProductId,
        product: productRef,
        available: item.available,
        reserved: resolvedReserved,
        sold: item.sold,
        trackInventory: item.trackInventory,
        lowStockThreshold: item.lowStockThreshold,
        stockState,
        isDiscontinued: item.isDiscontinued,
        createdAt: (item.createdAt as Date).toISOString(),
        updatedAt: (item.updatedAt as Date).toISOString(),
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      results: items.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      filters: {
        q: params.q,
        status: params.status,
        lowStock: params.lowStock,
      },
      sort: params.sort,
      inventory: items,
    };
  }

  // Atomically adjust available stock pool and write log history
  public async adjustInventory(
    productId: string,
    change: number,
    reason: InventoryTransactionReason,
    notes?: string | null,
    adminUserId?: string
  ): Promise<IInventory> {
    const redis = getRedisClient();
    const lockKey = `checkout:lock:${productId}`;
    const token = crypto.randomUUID();
    let acquired = false;

    // 1. Acquire per-product advisory lock (same as checkout)
    for (let attempt = 0; attempt < 10; attempt++) {
      const res = await redis.set(lockKey, token, 'PX', 5000, 'NX');
      if (res === 'OK') {
        acquired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!acquired) {
      throw new AppError(
        'Could not acquire inventory lock. Please try again.',
        HTTP_STATUS.CONFLICT
      );
    }

    const RELEASE_LOCK_LUA = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      // 2. Start Mongo transaction
        // 3. Re-read stock and check active reservations under lock
        const inventory = await Inventory.findOne({
          productId: new Types.ObjectId(productId),
        });
        if (!inventory) {
          throw new AppError('Inventory record not found.', HTTP_STATUS.NOT_FOUND);
        }

        if (inventory.isDiscontinued) {
          throw new AppError(
            'Discontinued products cannot receive stock adjustments.',
            HTTP_STATUS.BAD_REQUEST
          );
        }

        if (inventory.trackInventory) {
          const before = inventory.available;
          const after = before + change;

          if (after < 0) {
            throw new AppError(
              `Insufficient stock. Available stock cannot drop below zero.`,
              HTTP_STATUS.BAD_REQUEST
            );
          }

          if (change < 0) {
            const activeReservedQuantity = await checkoutService.getActiveReservedQuantity(
              redis,
              productId
            );
            if (after < activeReservedQuantity) {
              throw new AppError(
                `Cannot reduce available stock to ${after} because there are ${activeReservedQuantity} active reservations.`,
                HTTP_STATUS.CONFLICT
              );
            }
          }
        }

        // 4. Update and log via repository
        const updatedInventory = await inventoryRepository.adjustStock(
          new Types.ObjectId(productId),
          change,
          reason,
          notes || null,
          adminUserId ? new Types.ObjectId(adminUserId) : null
        );

        return updatedInventory;
    } finally {
      // 5. Safely release lock
      try {
        await redis.eval(RELEASE_LOCK_LUA, 1, lockKey, token);
      } catch {
        // Swallow lock release errors
      }
    }
  }

  // Fetch paginated history for a product
  public async getInventoryHistory(
    productId: string,
    rawQuery: ParsedQs
  ): Promise<InventoryHistoryListResult> {
    const parseResult = inventoryHistoryQuerySchema.shape.query.safeParse(rawQuery);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new AppError(
        firstIssue?.message ?? 'Invalid query parameters',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { page, limit } = parseResult.data as { page: number; limit: number };
    const skip = (page - 1) * limit;

    const [rawHistory, totalItems] = await Promise.all([
      inventoryRepository.getInventoryHistory(new Types.ObjectId(productId), skip, limit),
      inventoryRepository.countInventoryHistory(new Types.ObjectId(productId)),
    ]);

    const history: InventoryHistoryResultDTO[] = rawHistory.map((tx) => {
      const user = tx.createdBy as unknown as {
        _id: Types.ObjectId;
        name: string;
        email: string;
      } | null;
      return {
        _id: (tx as unknown as { _id: Types.ObjectId })._id.toString(),
        inventoryId: tx.inventoryId.toString(),
        reason: tx.reason,
        quantity: tx.quantity,
        before: tx.before,
        after: tx.after,
        notes: tx.notes,
        createdBy: user
          ? {
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
            }
          : null,
        createdAt: (tx.createdAt as Date).toISOString(),
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      results: history.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      history,
    };
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
