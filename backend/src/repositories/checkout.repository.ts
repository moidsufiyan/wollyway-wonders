import { ClientSession, Types } from 'mongoose';
import { CheckoutSession, ICheckoutSession } from '../models/checkout-session.model.js';
import { CheckoutStatus } from '../types/checkout.types.js';

export class CheckoutRepository {
  /**
   * Find a specific checkout session by ID.
   */
  async findById(sessionId: Types.ObjectId): Promise<ICheckoutSession | null> {
    return CheckoutSession.findById(sessionId);
  }

  /**
   * Retrieves the active checkout session for a user.
   * Active sessions are not in TERMINAL states (EXPIRED, CANCELLED, FAILED, COMPLETED).
   */
  async findActiveSession(userId: Types.ObjectId): Promise<ICheckoutSession | null> {
    return CheckoutSession.findOne({
      userId,
      status: { $in: ['CREATED', 'VALIDATING', 'READY', 'RESERVED', 'PAYMENT_PENDING'] },
    });
  }

  /**
   * Finds a checkout session by payment provider and gateway order/intent ID.
   */
  async findByPaymentIntent(
    paymentProvider: string,
    paymentIntentId: string
  ): Promise<ICheckoutSession | null> {
    return CheckoutSession.findOne({ paymentProvider, paymentIntentId });
  }

  /**
   * Creates a new Checkout Session document.
   */
  async createSession(sessionData: Partial<ICheckoutSession>): Promise<ICheckoutSession> {
    return CheckoutSession.create(sessionData);
  }

  /**
   * Updates status of checkout session.
   */
  async updateStatus(
    sessionId: Types.ObjectId,
    status: CheckoutStatus,
    extraUpdates: Partial<ICheckoutSession> = {},
    session?: ClientSession
  ): Promise<ICheckoutSession | null> {
    return CheckoutSession.findByIdAndUpdate(
      sessionId,
      { $set: { status, ...extraUpdates } },
      { new: true, session }
    );
  }

  /**
   * Extends the reservation window.
   */
  async extendReservation(
    sessionId: Types.ObjectId,
    expiresAt: Date,
    extensionCount: number
  ): Promise<ICheckoutSession | null> {
    return CheckoutSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          reservationExpiresAt: expiresAt,
          extensionCount,
        },
      },
      { new: true }
    );
  }

  /**
   * Compare-and-set claim of a checkout session for payment:
   * Transitions RESERVED -> PAYMENT_PENDING atomically.
   * Only one concurrent caller can succeed.
   */
  async claimForPayment(
    sessionId: Types.ObjectId,
    paymentProvider: string,
    paymentAttemptReceipt: string
  ): Promise<ICheckoutSession | null> {
    return CheckoutSession.findOneAndUpdate(
      { _id: sessionId, status: 'RESERVED' },
      {
        $set: {
          status: 'PAYMENT_PENDING',
          paymentProvider,
          paymentAttemptReceipt,
        },
      },
      { new: true }
    );
  }

  /**
   * Finds all non-completed sessions that have expired reservations.
   * Explicitly excludes PAYMENT_PENDING to protect in-flight or delayed webhook payments.
   */
  async findStaleExpiredSessions(): Promise<ICheckoutSession[]> {
    return CheckoutSession.find({
      status: { $in: ['READY', 'RESERVED'] },
      reservationExpiresAt: { $lt: new Date() },
    });
  }

  /**
   * Safely purges old terminal checkout sessions (COMPLETED, CANCELLED, EXPIRED, FAILED).
   * Preserves non-terminal states and protects PAYMENT_PENDING sessions.
   */
  async deleteOldTerminalSessions(olderThanMs: number = 48 * 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs);
    const result = await CheckoutSession.deleteMany({
      status: { $in: ['COMPLETED', 'CANCELLED', 'EXPIRED', 'FAILED'] },
      updatedAt: { $lt: cutoff },
    });
    return result.deletedCount || 0;
  }

  /**
   * Safely drops the legacy MongoDB createdAt_1 TTL index if present.
   */
  async dropLegacyTTLIndex(): Promise<void> {
    try {
      const indexes = await CheckoutSession.collection.indexes();
      const ttlIndex = indexes.find((idx) => idx.name === 'createdAt_1');
      if (ttlIndex) {
        await CheckoutSession.collection.dropIndex('createdAt_1');
      }
    } catch {
      // Ignore if index doesn't exist or collection hasn't been created yet
    }
  }
}

export const checkoutRepository = new CheckoutRepository();
