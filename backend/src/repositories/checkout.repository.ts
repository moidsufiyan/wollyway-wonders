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
   * Finds all non-completed sessions that have expired reservations.
   */
  async findStaleExpiredSessions(): Promise<ICheckoutSession[]> {
    return CheckoutSession.find({
      status: { $in: ['READY', 'PAYMENT_PENDING'] },
      reservationExpiresAt: { $lt: new Date() },
    });
  }
}

export const checkoutRepository = new CheckoutRepository();
