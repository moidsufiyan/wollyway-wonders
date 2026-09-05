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
  PaymentProvider,
  CheckoutItemSnapshot,
  ValidationIssue,
} from '../types/checkout.types.js';
import { calculateOrderTotals } from '../utils/pricing.util.js';

export class CheckoutService {
  private getRedisKey(sessionId: string): string {
    return `checkout:reservation:${sessionId}`;
  }

  private getSliceKey(sessionId: string, productId: string): string {
    return `checkout:rsv:${sessionId}:${productId}`;
  }

  private getLockKey(productId: string): string {
    return `checkout:lock:${productId}`;
  }

  /**
   * Discovers all active reservation slices for a product and sums their quantities.
   * Naturally excludes expired reservations since Redis automatically evicts expired keys.
   */
  public async getActiveReservedQuantity(
    redis: ReturnType<typeof getRedisClient>,
    productId: string
  ): Promise<number> {
    let cursor = '0';
    const keys: string[] = [];
    const matchPattern = `checkout:rsv:*:${productId}`;

    do {
      const [nextCursor, matchedKeys] = await redis.scan(
        cursor,
        'MATCH',
        matchPattern,
        'COUNT',
        100
      );
      cursor = nextCursor;
      if (matchedKeys.length > 0) {
        keys.push(...matchedKeys);
      }
    } while (cursor !== '0');

    if (keys.length === 0) {
      return 0;
    }

    const values = await redis.mget(...keys);
    let total = 0;
    for (const val of values) {
      if (val !== null) {
        const qty = parseInt(val, 10);
        if (!isNaN(qty)) {
          total += qty;
        }
      }
    }
    return total;
  }

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

    // Resolve stock levels dynamically (incorporating active Redis reservation slices)
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

      // Check stock levels including current active reservation slices
      const rawStock = stockMap.get(idStr) ?? 0;
      let reservedCount = 0;
      try {
        reservedCount = await this.getActiveReservedQuantity(redis, idStr);
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
   * Protected reservation operation using per-product advisory locks and per-session slices.
   * Lock release uses an ownership-verified Lua script to avoid naive DEL.
   */
  private async executeRedisReservation(
    sessionId: string,
    userId: string,
    items: CheckoutItemSnapshot[],
    stockLimits: Map<string, number>
  ): Promise<boolean> {
    const redis = getRedisClient();

    // Canonical lexicographical order to prevent distributed deadlocks
    const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId.toString()))).sort();
    const acquiredLocks: { key: string; token: string }[] = [];

    const RELEASE_LOCK_LUA = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      // 1. Acquire per-product advisory locks with backoff retry
      for (const pid of uniqueProductIds) {
        const lockKey = this.getLockKey(pid);
        const token = crypto.randomUUID();
        let acquired = false;

        for (let attempt = 0; attempt < 10; attempt++) {
          const res = await redis.set(lockKey, token, 'PX', 5000, 'NX');
          if (res === 'OK') {
            acquired = true;
            acquiredLocks.push({ key: lockKey, token });
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        if (!acquired) {
          return false; // Lock acquisition timed out; fail reservation safely
        }
      }

      // 2. Critical Section: Sum active slices and check against authoritative DB stock
      for (const item of items) {
        const idStr = item.productId.toString();
        const dbStock = stockLimits.get(idStr) ?? 0;
        const currentReserved = await this.getActiveReservedQuantity(redis, idStr);

        if (dbStock - currentReserved < item.quantity) {
          return false; // Insufficient stock
        }
      }

      // 3. Commit per-session reservation slices with 15-minute TTL
      const pipeline = redis.pipeline();
      for (const item of items) {
        const sliceKey = this.getSliceKey(sessionId, item.productId.toString());
        pipeline.set(sliceKey, item.quantity.toString(), 'EX', 900);
      }

      // Metadata session key for diagnostic/traceability
      pipeline.set(
        this.getRedisKey(sessionId),
        JSON.stringify({
          userId,
          sessionId,
          items: items.map((i) => ({ productId: i.productId.toString(), quantity: i.quantity })),
        }),
        'EX',
        900
      );

      await pipeline.exec();
      return true;
    } catch {
      return false;
    } finally {
      // 4. Safely release all acquired locks using ownership-verified Lua script
      for (const lock of acquiredLocks) {
        try {
          await redis.eval(RELEASE_LOCK_LUA, 1, lock.key, lock.token);
        } catch {
          // Swallow lock release errors
        }
      }
    }
  }

  /**
   * Releases per-session Redis reservation slice keys.
   * Ownership-safe: each session only deletes its own session slices.
   */
  private async executeRedisRelease(
    sessionId: string,
    items: CheckoutItemSnapshot[]
  ): Promise<void> {
    const redis = getRedisClient();
    try {
      const pipeline = redis.pipeline();
      for (const item of items) {
        const sliceKey = this.getSliceKey(sessionId, item.productId.toString());
        pipeline.del(sliceKey);
      }
      pipeline.del(this.getRedisKey(sessionId));
      await pipeline.exec();
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
      if (activeSession.status === 'PAYMENT_PENDING') {
        throw new AppError(
          'Cannot start a new checkout session while payment is pending. Please complete or dismiss current payment attempt.',
          HTTP_STATUS.CONFLICT
        );
      }
      await this.cancelCheckout(userId);
    }

    // 2. Fetch User Profile to get Shipping Address
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError('User account not found', HTTP_STATUS.NOT_FOUND);
    }

    const primaryAddress = (user.addresses?.find((addr) => addr.isDefault) ?? null) as unknown as {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
    const shippingAddressSnapshot = primaryAddress
      ? {
          street: primaryAddress.streetAddress,
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
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

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

    // Check if active session reservation has expired
    if (session.reservationExpiresAt && session.reservationExpiresAt.getTime() < Date.now()) {
      await this.expireSession(session._id as Types.ObjectId);
      throw new AppError('Checkout session expired', HTTP_STATUS.NOT_FOUND);
    }

    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

    return this.mapToDTO(session, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Extends the reservation time by 5 minutes (max 3 times).
   * Verifies individual reservation slices still exist in Redis before extending.
   * Updates Redis slice TTLs BEFORE MongoDB metadata so drift is prevented.
   */
  async extendCheckout(userId: Types.ObjectId): Promise<CheckoutSummaryDTO> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session || session.status !== 'RESERVED') {
      throw new AppError('No active reserved checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    if (session.extensionCount >= 3) {
      throw new AppError('Maximum checkout extension limit reached', HTTP_STATUS.BAD_REQUEST);
    }

    if (session.reservationExpiresAt && session.reservationExpiresAt.getTime() < Date.now()) {
      await this.expireSession(session._id as Types.ObjectId);
      throw new AppError(
        'Checkout reservation has already expired. Please restart checkout.',
        HTTP_STATUS.CONFLICT
      );
    }

    const redis = getRedisClient();

    // Verify all reservation slice keys still exist in Redis
    for (const item of session.cartSnapshot.items) {
      const sliceKey = this.getSliceKey(session._id.toString(), item.productId.toString());
      const ttl = await redis.ttl(sliceKey);
      if (ttl <= 0) {
        // Reservation slice has expired in Redis; fail safely and expire MongoDB session
        await this.expireSession(session._id as Types.ObjectId);
        throw new AppError(
          'Checkout reservation has already expired in cache. Please restart checkout.',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Extend Redis slice keys and session metadata key by 300s (5 minutes)
    const pipeline = redis.pipeline();
    for (const item of session.cartSnapshot.items) {
      const sliceKey = this.getSliceKey(session._id.toString(), item.productId.toString());
      const ttl = await redis.ttl(sliceKey);
      pipeline.expire(sliceKey, Math.max(ttl, 0) + 300);
    }
    const sessionKey = this.getRedisKey(session._id.toString());
    const sessionTtl = await redis.ttl(sessionKey);
    pipeline.expire(sessionKey, Math.max(sessionTtl, 0) + 300);
    await pipeline.exec();

    const newExpiry = new Date(
      (session.reservationExpiresAt?.getTime() ?? Date.now()) + 5 * 60 * 1000
    );
    const newCount = session.extensionCount + 1;

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
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

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
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

    return this.mapToDTO(updated, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Cancels checkout, releasing all stocks atomically.
   * Explicitly forbidden when session is actively in PAYMENT_PENDING.
   */
  async cancelCheckout(userId: Types.ObjectId): Promise<void> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session) return;

    if (session.status === 'PAYMENT_PENDING') {
      throw new AppError(
        'Cannot cancel checkout while payment is pending. Please wait for payment resolution or cancel payment intent first.',
        HTTP_STATUS.CONFLICT
      );
    }

    await this.executeRedisRelease(session._id.toString(), session.cartSnapshot.items);
    await checkoutRepository.updateStatus(session._id as Types.ObjectId, 'CANCELLED');
  }

  /**
   * Client-initiated recovery from PAYMENT_PENDING back to RESERVED
   * (e.g. when customer dismisses Razorpay checkout modal or payment fails on client).
   */
  async recoverPaymentPending(userId: Types.ObjectId): Promise<CheckoutSummaryDTO> {
    const session = await checkoutRepository.findActiveSession(userId);
    if (!session) {
      throw new AppError('No active checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    if (session.status !== 'PAYMENT_PENDING') {
      if (session.status === 'RESERVED') {
        const subtotal = session.cartSnapshot.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);
        return this.mapToDTO(session, subtotal, shippingFee, taxTotal, orderTotal);
      }
      throw new AppError(
        `Session cannot be recovered from status: ${session.status}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify reservation has not expired
    if (session.reservationExpiresAt && session.reservationExpiresAt.getTime() < Date.now()) {
      await this.expireSession(session._id as Types.ObjectId);
      throw new AppError(
        'Checkout reservation has expired. Please restart checkout.',
        HTTP_STATUS.CONFLICT
      );
    }

    const updated = await checkoutRepository.updateStatus(
      session._id as Types.ObjectId,
      'RESERVED',
      {
        paymentIntentId: null,
        paymentProvider: null,
      }
    );

    if (!updated) {
      throw new AppError(
        'Failed to recover checkout session state',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const subtotal = updated.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

    return this.mapToDTO(updated, subtotal, shippingFee, taxTotal, orderTotal);
  }

  /**
   * Triggers expiration transitions.
   * PAYMENT_PENDING sessions are never expired here to protect pending transactions and webhooks.
   */
  async expireSession(sessionId: Types.ObjectId): Promise<void> {
    const session = await checkoutRepository.findById(sessionId);
    if (
      !session ||
      ['COMPLETED', 'CANCELLED', 'EXPIRED', 'PAYMENT_PENDING'].includes(session.status)
    ) {
      return;
    }

    await this.executeRedisRelease(session._id.toString(), session.cartSnapshot.items);
    await checkoutRepository.updateStatus(sessionId, 'EXPIRED');
  }

  /**
   * Server bootstrap sweep reconciling stale expired checkout locks and legacy TTL indexes.
   */
  async reconcileStaleSessions(): Promise<void> {
    // 1. Drop unsafe legacy MongoDB TTL index if present
    await checkoutRepository.dropLegacyTTLIndex();

    // 2. Sweep expired READY/RESERVED sessions
    const stale = await checkoutRepository.findStaleExpiredSessions();
    for (const session of stale) {
      await this.expireSession(session._id as Types.ObjectId);
    }

    // 3. Purge terminal sessions older than 48 hours
    await checkoutRepository.deleteOldTerminalSessions();
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
      throw new AppError('Checkout session not found', HTTP_STATUS.NOT_FOUND);
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
