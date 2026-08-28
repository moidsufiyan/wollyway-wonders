import crypto from 'crypto';
import { Types } from 'mongoose';
import { getRedisClient } from '../config/redis.config.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { checkoutRepository } from '../repositories/checkout.repository.js';
import { User } from '../models/user.model.js';
import { ICheckoutSession } from '../models/checkout-session.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { orderRepository } from '../repositories/order.repository.js';
import {
  CheckoutSummaryDTO,
  ValidationIssue,
  PaymentProvider,
  CheckoutItemSnapshot,
} from '../types/checkout.types.js';

export class CheckoutService {
  private getRedisKey(sessionId: string): string {
    return `checkout:reservation:${sessionId}`;
  }

  private getReservedCountKey(productId: string): string {
    return `checkout:reserved-count:${productId}`;
  }

  /**
   * Helper sleep for retries.
  /**
   * Performs the validation pipeline on the cart, items, prices, and address.
   */
  public async runValidationPipeline(
    items: { productId: Types.ObjectId; quantity: number; priceSnapshot: number }[]
  ): Promise<{ issues: ValidationIssue[]; snapshots: CheckoutItemSnapshot[] }> {
    const issues: ValidationIssue[] = [];
    const snapshots: CheckoutItemSnapshot[] = [];

    const productIds = items.map((item) => item.productId);
    const products = await productRepository.findWithDiscovery(
      { _id: { $in: productIds } },
      { _id: 1, name: 1, slug: 1, price: 1, images: 1, visibility: 1 },
      {},
      0,
      items.length
    );
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Resolve stock levels dynamically (incorporating active Redis reservations)
    const redis = getRedisClient();
    const stockMap = await inventoryRepository.getBatchStock(productIds);

    for (const item of items) {
      const idStr = item.productId.toString();
      const product = productsMap.get(idStr);

      if (!product) {
        issues.push({ productId: idStr, reason: 'ARCHIVED' });
        continue;
      }

      if (product.visibility !== 'published') {
        issues.push({ productId: idStr, reason: 'UNPUBLISHED' });
        continue;
      }

      // Check current live price mismatch
      if (product.price !== item.priceSnapshot) {
        issues.push({
          productId: idStr,
          reason: 'PRICE_CHANGED',
          details: {
            snapshotPrice: item.priceSnapshot,
            currentPrice: product.price,
          },
        });
      }

      // Check stock levels including current active reservations
      const rawStock = stockMap.get(idStr) ?? 0;
      let reservedCount = 0;
      try {
        const val = await redis.get(this.getReservedCountKey(idStr));
        if (val) {
          reservedCount = parseInt(val, 10);
        }
      } catch {
        // Keep default 0
      }

      const availableStock = Math.max(0, rawStock - reservedCount);
      if (availableStock === 0 || item.quantity > availableStock) {
        issues.push({
          productId: idStr,
          reason: 'OUT_OF_STOCK',
          details: {
            availableStock,
            requestedQuantity: item.quantity,
          },
        });
      }

      const primaryImage = (product.images ?? []).find((img) => img.isPrimary) ?? null;

      snapshots.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: primaryImage?.url ?? '',
        slug: product.slug,
      });
    }

    return { issues, snapshots };
  }

  /**
   * Atomic stock reservation using a Lua script in Redis.
   */
  private async executeRedisReservation(
    sessionId: string,
    userId: string,
    items: CheckoutItemSnapshot[],
    stockLimits: Map<string, number>
  ): Promise<boolean> {
    const redis = getRedisClient();
    const reservationKey = this.getRedisKey(sessionId);

    // KEYS: [reservationKey, countKey1, countKey2, ...]
    const keys = [reservationKey];
    // ARGS: [sessionJsonData, stockLimit1, reqQty1, stockLimit2, reqQty2, ...]
    const args: string[] = [];

    const sessionPayload = JSON.stringify({
      userId,
      items: items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
      })),
    });

    args.push(sessionPayload);

    for (const item of items) {
      const idStr = item.productId.toString();
      keys.push(this.getReservedCountKey(idStr));
      const dbStock = stockLimits.get(idStr) ?? 0;
      args.push(dbStock.toString(), item.quantity.toString());
    }

    const luaScript = `
      local reservationKey = KEYS[1]
      local sessionData = ARGS[1]
      local numItems = (#KEYS - 1)

      -- 1. Dry run validation assertions
      for i = 1, numItems do
        local countKey = KEYS[i + 1]
        local dbStock = tonumber(ARGS[2 * i])
        local reqQty = tonumber(ARGS[2 * i + 1])
        
        local currentReserved = tonumber(redis.call('get', countKey) or 0)
        if (dbStock - currentReserved) < reqQty then
          return 0 -- Insufficient stock
        end
      end

      -- 2. Commit allocations
      for i = 1, numItems do
        local countKey = KEYS[i + 1]
        local reqQty = tonumber(ARGS[2 * i + 1])
        redis.call('incrby', countKey, reqQty)
        redis.call('expire', countKey, 900) -- 15 mins lock TTL
      end

      redis.call('setex', reservationKey, 900, sessionData)
      return 1
    `;

    try {
      const result = await redis.eval(luaScript, keys.length, ...keys, ...args);
      return result === 1;
    } catch {
      // Fallback if Redis is down: skip Redis lock assertions and permit checkout
      // (safeguarded via database level validations)
      return true;
    }
  }

  /**
   * Atomically releases Redis reservation locks.
   */
  private async executeRedisRelease(
    sessionId: string,
    items: CheckoutItemSnapshot[]
  ): Promise<void> {
    const redis = getRedisClient();
    const reservationKey = this.getRedisKey(sessionId);

    const keys = [reservationKey];
    const args: string[] = [];

    for (const item of items) {
      keys.push(this.getReservedCountKey(item.productId.toString()));
      args.push(item.quantity.toString());
    }

    const luaScript = `
      local numItems = #KEYS - 1
      for i = 1, numItems do
        local countKey = KEYS[i + 1]
        local qty = tonumber(ARGS[i])
        local current = tonumber(redis.call('get', countKey) or 0)
        if current > 0 then
          local newCount = current - qty
          if newCount <= 0 then
            redis.call('del', countKey)
          else
            redis.call('decrby', countKey, qty)
          end
        end
      end
      redis.call('del', KEYS[1])
      return 1
    `;

    try {
      await redis.eval(luaScript, keys.length, ...keys, ...args);
    } catch {
      // Gracefully swallow Redis errors on release sweeps
    }
  }

  /**
   * Public interface to release Redis locks after Order creation commits.
   */
  public async releaseSessionLocks(
    sessionId: string,
    items: CheckoutItemSnapshot[]
  ): Promise<void> {
    return this.executeRedisRelease(sessionId, items);
  }

  /**
   * Initializes a Checkout Session for the user.
   */
  async startCheckout(userId: Types.ObjectId): Promise<CheckoutSummaryDTO> {
    // 1. Check for existing active checkout sessions to clear/expire first
    const activeSession = await checkoutRepository.findActiveSession(userId);
    if (activeSession) {
      await this.cancelCheckout(userId);
    }

    // 2. Fetch User Profile to get Shipping Address
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError('User account not found', HTTP_STATUS.NOT_FOUND);
    }

    const primaryAddress = (user.addresses?.find((addr) => addr.isDefault) ?? null) as unknown as {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
    const shippingAddressSnapshot = primaryAddress
      ? {
          street: primaryAddress.street,
          city: primaryAddress.city,
          state: primaryAddress.state,
          postalCode: primaryAddress.postalCode,
          country: primaryAddress.country,
        }
      : null;

    // 3. Fetch user Cart
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cannot start checkout with an empty cart', HTTP_STATUS.BAD_REQUEST);
    }

    // 4. Run validation pipelines
    const { issues, snapshots } = await runValidationPipelineWrapper(this, cart.items);

    if (issues.length > 0) {
      throw new AppError(
        'Checkout validation failed: ' + JSON.stringify(issues),
        HTTP_STATUS.CONFLICT
      );
    }

    const subtotal = snapshots.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = subtotal > 15000 ? 0 : 500; // Free shipping above ₹150
    const taxTotal = Math.round(subtotal * 0.08); // 8% derived flat tax
    const orderTotal = subtotal + shippingFee + taxTotal;

    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const idempotencyKey = crypto.randomUUID();

    // 5. Create database record
    const session = await checkoutRepository.createSession({
      userId,
      cartId: cart._id as Types.ObjectId,
      status: 'READY',
      reservationId: this.getRedisKey(idempotencyKey),
      reservationExpiresAt,
      validatedAt: new Date(),
      cartSnapshot: { items: snapshots },
      shippingAddressSnapshot,
      idempotencyKey,
      extensionCount: 0,
    });

    // 6. Acquire Redis stock reservation locks
    const productIds = snapshots.map((s) => s.productId);
    const stockMap = await inventoryRepository.getBatchStock(productIds);
    const locked = await this.executeRedisReservation(
      session._id.toString(),
      userId.toString(),
      snapshots,
      stockMap
    );

    if (!locked) {
      await checkoutRepository.updateStatus(session._id as Types.ObjectId, 'FAILED');
      throw new AppError(
        'Some items in your cart became unavailable. Please adjust quantities.',
        HTTP_STATUS.CONFLICT
      );
    }

    await checkoutRepository.updateStatus(session._id as Types.ObjectId, 'RESERVED', {
      reservationId: this.getRedisKey(session._id.toString()),
    });

    return this.mapToDTO(session, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Retrieves the current user's active checkout session DTO.
   */
  async getCurrentCheckout(userId: Types.ObjectId): Promise<CheckoutSummaryDTO> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session) {
      throw new AppError('No active checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 15000 ? 0 : 500;
    const taxTotal = Math.round(subtotal * 0.08);
    const orderTotal = subtotal + shippingFee + taxTotal;

    return this.mapToDTO(session, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Extends the reservation time by 5 minutes (max 3 times).
   */
  async extendCheckout(userId: Types.ObjectId): Promise<CheckoutSummaryDTO> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session || session.status !== 'RESERVED') {
      throw new AppError('No active reserved checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    if (session.extensionCount >= 3) {
      throw new AppError('Maximum checkout extension limit reached', HTTP_STATUS.BAD_REQUEST);
    }

    const newExpiry = new Date(
      (session.reservationExpiresAt?.getTime() ?? Date.now()) + 5 * 60 * 1000
    );
    const newCount = session.extensionCount + 1;

    // Extend Redis TTL lock
    const redis = getRedisClient();
    const redisKey = this.getRedisKey(session._id.toString());
    try {
      const ttl = await redis.ttl(redisKey);
      if (ttl > 0) {
        await redis.expire(redisKey, ttl + 300);
      }
    } catch {
      // Swallowed
    }

    const updated = await checkoutRepository.extendReservation(
      session._id as Types.ObjectId,
      newExpiry,
      newCount
    );

    if (!updated) {
      throw new AppError('Failed to update session parameters', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const subtotal = updated.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 15000 ? 0 : 500;
    const taxTotal = Math.round(subtotal * 0.08);
    const orderTotal = subtotal + shippingFee + taxTotal;

    return this.mapToDTO(updated, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Confirms payment processing start, setting status to PAYMENT_PENDING.
   */
  async confirmCheckout(
    userId: Types.ObjectId,
    idempotencyKey: string,
    paymentProvider: PaymentProvider
  ): Promise<CheckoutSummaryDTO> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session || session.status !== 'RESERVED') {
      throw new AppError('No active reserved checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    // Verify idempotency
    const redis = getRedisClient();
    const idemKey = `idempotency:checkout:${idempotencyKey}`;
    try {
      const active = await redis.get(idemKey);
      if (active) {
        throw new AppError('Payment request is already being processed.', HTTP_STATUS.CONFLICT);
      }
      await redis.setex(idemKey, 120, 'pending');
    } catch {
      // Swallowed
    }

    const updated = await checkoutRepository.updateStatus(
      session._id as Types.ObjectId,
      'PAYMENT_PENDING',
      {
        paymentProvider,
        idempotencyKey,
      }
    );

    if (!updated) {
      throw new AppError('Failed to transition session state', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const subtotal = updated.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 15000 ? 0 : 500;
    const taxTotal = Math.round(subtotal * 0.08);
    const orderTotal = subtotal + shippingFee + taxTotal;

    return this.mapToDTO(updated, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Cancels checkout, releasing all stocks atomically.
   */
  async cancelCheckout(userId: Types.ObjectId): Promise<void> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session) return;

    await this.executeRedisRelease(session._id.toString(), session.cartSnapshot.items);
    await checkoutRepository.updateStatus(session._id as Types.ObjectId, 'CANCELLED');
  }

  /**
   * Triggers expiration transitions.
   */
  async expireSession(sessionId: Types.ObjectId): Promise<void> {
    const session = await checkoutRepository.findById(sessionId);
    if (!session || ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(session.status)) {
      return;
    }

    await this.executeRedisRelease(session._id.toString(), session.cartSnapshot.items);
    await checkoutRepository.updateStatus(sessionId, 'EXPIRED');
  }

  /**
   * Server bootstrap sweep reconciling stale expired checkout locks.
   */
  async reconcileStaleSessions(): Promise<void> {
    const stale = await checkoutRepository.findStaleExpiredSessions();
    for (const session of stale) {
      await this.expireSession(session._id as Types.ObjectId);
    }
  }

  /**
   * Retrieves safe status of a session, and related order details if completed.
   */
  async getSessionStatus(
    userId: Types.ObjectId,
    sessionId: Types.ObjectId
  ): Promise<{ status: string; orderId?: string; orderNumber?: string }> {
    const session = await checkoutRepository.findById(sessionId);
    
    if (!session) {
      throw new AppError('Checkout session not found', HTTP_STATUS.NOT_FOUND);
    }
    
    if (session.userId.toString() !== userId.toString()) {
      throw new AppError('Unauthorized access', HTTP_STATUS.UNAUTHORIZED);
    }

    if (session.status === 'COMPLETED') {
      const order = await orderRepository.findByCheckoutSessionId(sessionId);
      if (order) {
        return {
          status: session.status,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        };
      }
    }

    return { status: session.status };
  }

  private mapToDTO(
    session: ICheckoutSession,
    subtotal: number,
    shippingFee: number,
    taxTotal: number,
    orderTotal: number
  ): CheckoutSummaryDTO {
    return {
      sessionId: session._id.toString(),
      items: session.cartSnapshot.items.map((i: CheckoutItemSnapshot) => ({
        productId: i.productId.toString(),
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        slug: i.slug,
        isAvailable: true,
      })),
      shippingAddressSnapshot: session.shippingAddressSnapshot,
      totals: {
        subtotal,
        shippingFee,
        taxTotal,
        orderTotal,
      },
      reservationExpiresAt: session.reservationExpiresAt,
      status: session.status,
      paymentProvider: session.paymentProvider,
      paymentIntentId: session.paymentIntentId,
    };
  }
}

// Separate function to wrapper runValidationPipeline inside class instance compiled scope context.
async function runValidationPipelineWrapper(
  service: CheckoutService,
  items: { productId: Types.ObjectId; quantity: number; priceSnapshot: number }[]
) {
  return service.runValidationPipeline(items);
}

export const checkoutService = new CheckoutService();
