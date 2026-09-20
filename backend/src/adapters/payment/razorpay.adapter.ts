import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env.config.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/index.js';
import {
  IPaymentProvider,
  PaymentProviderType,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  NormalizedWebhookEvent,
  RefundPaymentInput,
  RefundResult,
} from '../../types/payment.types.js';

export class RazorpayAdapter implements IPaymentProvider {
  public readonly providerName: PaymentProviderType = 'razorpay';
  private client: Razorpay | null = null;

  constructor() {
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  private getClient(): Razorpay {
    if (!this.client) {
      if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new AppError(
          'Razorpay credentials are not configured on server',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
    return this.client;
  }

  /**
   * Reconciles whether an order already exists at Razorpay with this deterministic receipt.
   */
  public async findOrderByReceipt(receipt: string): Promise<PaymentIntentResult | null> {
    const razorpay = this.getClient();
    try {
      const response = (await razorpay.orders.all({ receipt })) as {
        entity?: string;
        count?: number;
        items?: Array<{
          id: string;
          amount: number | string;
          currency: string;
          receipt?: string;
          status: string;
        }>;
      };

      if (response && response.items && response.items.length > 0) {
        const order = response.items[0];
        logger.info(
          { gatewayOrderId: order.id, receipt, status: order.status },
          'Reconciled existing Razorpay order by deterministic receipt'
        );
        return {
          provider: this.providerName,
          clientReference: order.id,
          amount: typeof order.amount === 'string' ? parseInt(order.amount, 10) : order.amount,
          currency: order.currency,
          keyId: env.RAZORPAY_KEY_ID,
          extra: {
            receipt: order.receipt,
          },
        };
      }
      return null;
    } catch (err: unknown) {
      logger.error(
        { err, receipt },
        'Failed to query Razorpay orders by receipt for reconciliation'
      );
      throw new AppError(
        'Unable to reconcile payment gateway state. Please retry in a moment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { isUnknownOutcome: true }
      );
    }
  }

  /**
   * Generates a new Razorpay Order for customer checkout.
   */
  public async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const razorpay = this.getClient();

    // Deterministic receipt derived stably from checkoutSessionId (max 40 chars)
    const receipt = input.receipt || `rcpt_${input.checkoutSessionId}`;

    try {
      if (env.RAZORPAY_KEY_ID === 'mock_razorpay_key_id') {
        logger.info(
          {
            provider: this.providerName,
            checkoutSessionId: input.checkoutSessionId,
            amount: input.amount,
          },
          'Mocking Razorpay payment intent creation for development'
        );

        return {
          provider: this.providerName,
          clientReference: `mock_order_${crypto.randomBytes(8).toString('hex')}`,
          amount: input.amount as number,
          currency: 'INR',
          keyId: env.RAZORPAY_KEY_ID,
          extra: {
            receipt,
          },
        };
      }

      const order = await razorpay.orders.create({
        amount: input.amount, // Integer paisa (e.g. 249900 = ₹2,499.00)
        currency: 'INR',
        receipt,
        notes: {
          checkoutSessionId: input.checkoutSessionId,
          customerName: input.customer.name,
          customerEmail: input.customer.email,
          ...(input.notes || {}),
        },
      });

      logger.info(
        {
          provider: this.providerName,
          gatewayOrderId: order.id,
          checkoutSessionId: input.checkoutSessionId,
          amount: input.amount,
        },
        'Razorpay payment intent created successfully'
      );

      return {
        provider: this.providerName,
        clientReference: order.id,
        amount: order.amount as number,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
        extra: {
          receipt: order.receipt,
        },
      };
    } catch (err: unknown) {
      logger.error(
        {
          err,
          checkoutSessionId: input.checkoutSessionId,
        },
        'Failed to create Razorpay Order'
      );

      const anyErr = err as Record<string, unknown>;
      const statusCode = (anyErr?.statusCode as number) || (anyErr?.status as number);
      const isDefiniteRejection =
        typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;

      if (isDefiniteRejection) {
        const errObj = anyErr?.error as Record<string, unknown> | undefined;
        const desc =
          (errObj?.description as string) ||
          (anyErr?.message as string) ||
          'Provider rejected payment intent creation';
        throw new AppError(
          `Payment initialization rejected by provider: ${desc}`,
          HTTP_STATUS.BAD_REQUEST,
          { isDefiniteRejection: true }
        );
      }

      // Network errors, timeouts, connection resets, 5xx responses represent unknown gateway outcomes
      throw new AppError(
        'Payment gateway response timed out or is uncertain. Please retry in a moment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { isUnknownOutcome: true }
      );
    }
  }

  /**
   * Cryptographically verifies the raw webhook body using HMAC SHA256 and timingSafeEqual.
   * Defends against side-channel timing attacks and malformed/truncated signatures.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (env.RAZORPAY_WEBHOOK_SECRET === 'mock_razorpay_webhook_secret') {
      logger.info('Mocking Razorpay webhook signature verification for development');
      return true;
    }

    if (!signature || typeof signature !== 'string' || !env.RAZORPAY_WEBHOOK_SECRET) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(signature.trim(), 'utf8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (err) {
      logger.error({ err }, 'Exception during Razorpay webhook signature verification');
      return false;
    }
  }

  /**
   * Transforms the raw Razorpay webhook payload into a provider-agnostic event.
   */
  public normalizeWebhookEvent(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): NormalizedWebhookEvent {
    let payload: Record<string, unknown>;

    try {
      payload =
        typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new AppError('Invalid JSON payload in webhook body', HTTP_STATUS.BAD_REQUEST);
    }

    const eventType = (payload.event as string) || 'unknown';
    const payloadContainer = (payload.payload as Record<string, unknown>) || {};
    const paymentEntity =
      ((payloadContainer.payment as Record<string, unknown>)?.entity as Record<string, unknown>) ||
      null;
    const orderEntity =
      ((payloadContainer.order as Record<string, unknown>)?.entity as Record<string, unknown>) ||
      null;

    // Resolve event ID (from header or composite fallback)
    const headerEventId =
      (headers['x-razorpay-event-id'] as string) || (headers['X-Razorpay-Event-Id'] as string);

    const transactionId = (paymentEntity?.id as string) || '';
    const gatewayOrderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || '';

    const eventId =
      headerEventId ||
      (transactionId ? `${eventType}:${transactionId}` : `${eventType}:${gatewayOrderId}`);

    // Determine payment success
    const isPaymentSuccess =
      (eventType === 'payment.captured' && paymentEntity?.status === 'captured') ||
      (eventType === 'order.paid' && orderEntity?.status === 'paid');

    const amount = (paymentEntity?.amount ?? orderEntity?.amount ?? 0) as number;
    const currency = (paymentEntity?.currency ?? orderEntity?.currency ?? 'INR') as string;

    const createdAtSeconds = (paymentEntity?.created_at ??
      payload.created_at ??
      Math.floor(Date.now() / 1000)) as number;
    const paidAt = new Date(createdAtSeconds * 1000);

    const paymentNotes = (paymentEntity?.notes as Record<string, string>) || {};
    const orderNotes = (orderEntity?.notes as Record<string, string>) || {};

    const checkoutSessionId =
      paymentNotes.checkoutSessionId || orderNotes.checkoutSessionId || undefined;
    const userId = paymentNotes.userId || orderNotes.userId || undefined;

    return {
      eventId,
      eventType,
      isPaymentSuccess,
      provider: this.providerName,
      transactionId,
      gatewayOrderId,
      amount,
      currency,
      paidAt,
      metadata: {
        checkoutSessionId,
        userId,
      },
      rawPayload: payload,
    };
  }

  /**
   * Reconciles an existing refund for a transaction matching receipt, amount, and processed status.
   *
   * Uses `razorpay.payments.fetchMultipleRefund(paymentId)` — the correct Razorpay SDK v2.x API
   * for listing all refunds associated with a specific payment.
   *
   * @see https://razorpay.com/docs/api/refunds/#fetch-multiple-refunds-for-a-payment
   */
  public async findRefundByReceipt(
    receipt: string,
    transactionId: string,
    expectedAmount?: number
  ): Promise<RefundResult | null> {
    const razorpay = this.getClient();
    try {
      // SDK v2.x: razorpay.payments.fetchMultipleRefund(paymentId, paginationParams?)
      // Returns { entity, count, items: RazorpayRefund[] }
      const response = await razorpay.payments.fetchMultipleRefund(transactionId);

      if (response && response.items && response.items.length > 0) {
        const matched = response.items.find((item) => {
          const matchReceipt = !receipt || item.receipt === receipt;
          const matchTx = !transactionId || item.payment_id === transactionId;
          const numAmount =
            typeof item.amount === 'string' ? parseInt(item.amount as string, 10) : item.amount;
          const matchAmount = expectedAmount === undefined || numAmount === expectedAmount;
          const isProcessed = item.status === 'processed';

          return matchReceipt && matchTx && matchAmount && isProcessed;
        });

        if (matched) {
          const numAmount =
            typeof matched.amount === 'string'
              ? parseInt(matched.amount as string, 10)
              : (matched.amount as number);
          logger.info(
            { refundId: matched.id, transactionId, receipt, amount: numAmount },
            'Reconciled existing processed refund from Razorpay'
          );
          return {
            refundId: matched.id,
            amount: numAmount,
            currency: matched.currency,
            status: 'processed',
          };
        }
      }
      return null;
    } catch (err: unknown) {
      logger.error(
        { err, transactionId, receipt },
        'Failed to query Razorpay payment refunds for reconciliation'
      );
      return null;
    }
  }

  /**
   * Initiates an external refund with Razorpay.
   */
  public async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    const razorpay = this.getClient();

    try {
      const refund = (await razorpay.payments.refund(input.transactionId, {
        amount: input.amount, // in paisa
        receipt: input.receipt,
        notes: input.notes,
      })) as {
        id: string;
        amount: number;
        currency: string;
        status: string;
      };

      logger.info(
        {
          provider: this.providerName,
          refundId: refund.id,
          paymentId: input.transactionId,
          amount: input.amount,
          status: refund.status,
        },
        'Razorpay refund issued successfully'
      );

      return {
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status === 'processed' ? 'processed' : 'pending',
        rawResponse: refund as unknown as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error(
        {
          err,
          paymentId: input.transactionId,
          amount: input.amount,
        },
        'Failed to issue Razorpay refund'
      );

      const anyErr = err as Record<string, unknown>;
      const statusCode = (anyErr?.statusCode as number) || (anyErr?.status as number);
      const isDefiniteRejection =
        typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;

      if (isDefiniteRejection) {
        const errObj = anyErr?.error as Record<string, unknown> | undefined;
        const desc =
          (errObj?.description as string) ||
          (anyErr?.message as string) ||
          'Provider rejected refund request';

        // Check if the payment was already refunded on Razorpay
        if (
          desc.toLowerCase().includes('already been refunded') ||
          desc.toLowerCase().includes('fully refunded')
        ) {
          logger.warn(
            { paymentId: input.transactionId, desc },
            'Payment already marked refunded on Razorpay; reconciling'
          );

          // Try to locate the existing refund by receipt and payment ID
          const existing = await this.findRefundByReceipt(
            input.receipt,
            input.transactionId,
            input.amount
          );
          if (existing) {
            return existing;
          }

          return {
            refundId: `rfnd_reconciled_${input.transactionId}`,
            amount: input.amount,
            currency: input.currency,
            status: 'processed',
          };
        }

        throw new AppError(
          `Payment refund rejected by provider: ${desc}`,
          HTTP_STATUS.BAD_REQUEST,
          { isDefiniteRejection: true }
        );
      }

      // Network errors, timeouts, connection resets, 5xx responses represent unknown gateway outcomes
      throw new AppError(
        'Payment gateway response timed out or is uncertain. Please retry in a moment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { isUnknownOutcome: true }
      );
    }
  }
}

export const razorpayAdapter = new RazorpayAdapter();
