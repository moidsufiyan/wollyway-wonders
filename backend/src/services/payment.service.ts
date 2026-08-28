import { Types } from 'mongoose';
import { orderService } from './order.service.js';
import { checkoutRepository } from '../repositories/checkout.repository.js';
import { paymentRepository } from '../repositories/payment.repository.js';
import { PaymentProviderFactory } from '../adapters/payment/payment-provider.factory.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS, PAYMENT_WEBHOOK_STATUS } from '../constants/index.js';
import { env } from '../config/env.config.js';
import {
  PaymentProviderType,
  PaymentIntentResult,
  WebhookProcessingResult,
  PaymentConfirmationPayload,
} from '../types/payment.types.js';

export class PaymentService {
  /**
   * Initializes or reuses a gateway payment intent for the authenticated customer's active checkout session.
   *
   * Invariants:
   * 1. Bound strictly to req.user._id (no client-specified sessionId).
   * 2. Reuses existing paymentIntentId if an intent already exists for this provider.
   * 3. Authoritative order total calculated strictly from frozen CheckoutSession snapshots.
   */
  public async createPaymentIntent(
    userId: string,
    provider: PaymentProviderType
  ): Promise<PaymentIntentResult> {
    const userObjectId = new Types.ObjectId(userId);
    const session = await checkoutRepository.findActiveSession(userObjectId);

    if (!session) {
      throw new AppError('No active checkout session found', HTTP_STATUS.NOT_FOUND);
    }

    if (!['RESERVED', 'PAYMENT_PENDING'].includes(session.status)) {
      throw new AppError('Checkout session is not in a payable state', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify reservation has not expired
    if (session.reservationExpiresAt && session.reservationExpiresAt.getTime() < Date.now()) {
      throw new AppError(
        'Checkout reservation has expired. Please restart checkout.',
        HTTP_STATUS.CONFLICT
      );
    }

    // Authoritative total calculated strictly from frozen item snapshots
    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 15000 ? 0 : 500;
    const taxTotal = Math.round(subtotal * 0.08);
    const orderTotal = subtotal + shippingFee + taxTotal;

    // Idempotency: Reuse existing active gateway intent if already created for this provider
    if (
      session.paymentProvider === provider &&
      session.paymentIntentId &&
      session.status === 'PAYMENT_PENDING'
    ) {
      logger.info(
        {
          sessionId: session._id.toString(),
          provider,
          existingIntentId: session.paymentIntentId,
        },
        'Reusing existing gateway payment intent on active checkout session'
      );

      return {
        provider,
        clientReference: session.paymentIntentId,
        amount: orderTotal,
        currency: 'INR',
        keyId: provider === 'razorpay' ? env.RAZORPAY_KEY_ID : undefined,
      };
    }

    const user = await User.findById(userObjectId);
    if (!user) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }

    const adapter = PaymentProviderFactory.getProvider(provider);

    const intentResult = await adapter.createPaymentIntent({
      checkoutSessionId: session._id.toString(),
      amount: orderTotal,
      currency: 'INR',
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
      },
      notes: {
        userId: user._id.toString(),
      },
    });

    // Record gateway order reference onto CheckoutSession
    await checkoutRepository.updateStatus(session._id as Types.ObjectId, 'PAYMENT_PENDING', {
      paymentProvider: provider,
      paymentIntentId: intentResult.clientReference,
    });

    return intentResult;
  }

  /**
   * Processes verified payment gateway webhooks.
   *
   * Execution Pipeline:
   * 1. Cryptographic HMAC signature check (timingSafeEqual).
   * 2. Event normalization.
   * 3. Atomic event claiming with duplicate absorption.
   * 4. Multi-factor session & amount reconciliation.
   * 5. Invocation of OrderService.createOrderFromCheckout().
   * 6. Transition event state to PROCESSED only after order commit.
   */
  public async handleWebhook(
    provider: PaymentProviderType,
    rawBody: string | Buffer,
    signature: string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookProcessingResult> {
    const adapter = PaymentProviderFactory.getProvider(provider);

    // 1. Verify Webhook Signature
    const isValidSignature = adapter.verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      logger.warn({ provider }, 'Webhook signature verification failed');
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Invalid webhook signature',
      };
    }

    // 2. Normalize Webhook Event
    const normalized = adapter.normalizeWebhookEvent(rawBody, headers);

    // 3. Atomically Claim Webhook Event
    const claimResult = await paymentRepository.claimEvent(
      normalized.eventId,
      provider,
      normalized.eventType,
      normalized.gatewayOrderId,
      normalized.transactionId,
      {
        eventType: normalized.eventType,
        amount: normalized.amount,
        currency: normalized.currency,
        isPaymentSuccess: normalized.isPaymentSuccess,
      }
    );

    if (claimResult.isDuplicate) {
      logger.info(
        { eventId: normalized.eventId, provider },
        'Duplicate webhook event safely absorbed'
      );
      return {
        status: 'DUPLICATE',
        statusCode: HTTP_STATUS.OK,
        message: 'Webhook event already processed',
      };
    }

    // 4. Filter for payment capture events
    if (!normalized.isPaymentSuccess) {
      logger.info(
        { eventId: normalized.eventId, eventType: normalized.eventType },
        'Non-capture webhook event received; marking as IGNORED'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.IGNORED,
        { errorMessage: `Non-capture event type: ${normalized.eventType}` }
      );
      return {
        status: 'IGNORED',
        statusCode: HTTP_STATUS.OK,
        message: `Event ${normalized.eventType} recorded; no order action required`,
      };
    }

    // 5. Resolve CheckoutSession
    let session = null;
    if (
      normalized.metadata.checkoutSessionId &&
      Types.ObjectId.isValid(normalized.metadata.checkoutSessionId)
    ) {
      session = await checkoutRepository.findById(
        new Types.ObjectId(normalized.metadata.checkoutSessionId)
      );
    }

    // Fallback: search by gateway paymentIntentId if metadata was not found
    if (!session && normalized.gatewayOrderId) {
      session = await checkoutRepository.findByPaymentIntent(provider, normalized.gatewayOrderId);
    }

    if (!session) {
      logger.error(
        {
          eventId: normalized.eventId,
          gatewayOrderId: normalized.gatewayOrderId,
          checkoutSessionId: normalized.metadata.checkoutSessionId,
        },
        'Associated checkout session could not be resolved from webhook'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        { errorMessage: 'Checkout session not found' }
      );
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Associated checkout session not found',
      };
    }

    // 6. Verify provider matches session
    if (session.paymentProvider && session.paymentProvider !== provider) {
      logger.error(
        { eventId: normalized.eventId, expected: session.paymentProvider, received: provider },
        'Payment provider mismatch against checkout session'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        { errorMessage: 'Payment provider mismatch' }
      );
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Provider mismatch with checkout session',
      };
    }

    // 7. Verify gatewayOrderId matches session.paymentIntentId
    if (session.paymentIntentId && session.paymentIntentId !== normalized.gatewayOrderId) {
      logger.error(
        {
          eventId: normalized.eventId,
          expected: session.paymentIntentId,
          received: normalized.gatewayOrderId,
        },
        'Gateway order reference does not match checkout session'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        { errorMessage: 'Gateway order reference mismatch' }
      );
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Gateway order reference mismatch',
      };
    }

    // 8. If session is already COMPLETED, safely acknowledge duplicate
    if (session.status === 'COMPLETED') {
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.PROCESSED,
        { processedAt: new Date() }
      );
      return {
        status: 'DUPLICATE',
        statusCode: HTTP_STATUS.OK,
        message: 'Order already created for this session',
      };
    }

    // 9. Reconcile Amount & Currency strictly from frozen snapshots
    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 15000 ? 0 : 500;
    const taxTotal = Math.round(subtotal * 0.08);
    const expectedOrderTotal = subtotal + shippingFee + taxTotal;

    if (normalized.amount !== expectedOrderTotal) {
      logger.error(
        {
          eventId: normalized.eventId,
          expectedAmount: expectedOrderTotal,
          receivedAmount: normalized.amount,
        },
        'CRITICAL: Payment amount mismatch between gateway and frozen checkout session'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        {
          errorMessage: `Amount mismatch: expected ${expectedOrderTotal}, got ${normalized.amount}`,
        }
      );
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Payment amount mismatch',
      };
    }

    if (normalized.currency.toUpperCase() !== 'INR') {
      logger.error(
        { eventId: normalized.eventId, receivedCurrency: normalized.currency },
        'CRITICAL: Payment currency mismatch'
      );
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        { errorMessage: `Currency mismatch: expected INR, got ${normalized.currency}` }
      );
      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Currency mismatch',
      };
    }

    // 10. Construct trusted confirmation payload
    const paymentConfirmation: PaymentConfirmationPayload = {
      provider,
      transactionId: normalized.transactionId,
      amount: normalized.amount,
      currency: normalized.currency.toUpperCase(),
      paidAt: normalized.paidAt,
    };

    // 11. Trigger Order Domain ACID transaction
    try {
      const order = await orderService.createOrderFromCheckout(
        session._id.toString(),
        paymentConfirmation
      );

      // 12. Only update event to PROCESSED after successful order creation commit
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.PROCESSED,
        { processedAt: new Date() }
      );

      logger.info(
        {
          eventId: normalized.eventId,
          orderId: order.id,
          orderNumber: order.orderNumber,
          transactionId: normalized.transactionId,
        },
        'Order created successfully from verified payment webhook'
      );

      return {
        status: 'PROCESSED',
        statusCode: HTTP_STATUS.OK,
        message: 'Order created successfully',
        orderId: order.id,
        orderNumber: order.orderNumber,
      };
    } catch (err: unknown) {
      logger.error(
        { err, eventId: normalized.eventId, sessionId: session._id.toString() },
        'Transaction error during createOrderFromCheckout'
      );

      // Leave event retryable so gateway retry can re-attempt
      await paymentRepository.updateEventStatus(
        normalized.eventId,
        provider,
        PAYMENT_WEBHOOK_STATUS.FAILED,
        {
          errorMessage: err instanceof Error ? err.message : 'Unknown order creation error',
          retryable: true,
        }
      );

      return {
        status: 'FAILED',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Internal error processing order creation',
      };
    }
  }
}

export const paymentService = new PaymentService();
