import {
  PaymentWebhookEvent,
  IPaymentWebhookEvent,
} from '../models/payment-webhook-event.model.js';
import { PaymentProviderType } from '../types/payment.types.js';
import { PAYMENT_WEBHOOK_STATUS, PaymentWebhookStatus } from '../constants/index.js';
import { logger } from '../utils/logger.js';

export interface ClaimEventResult {
  claimed: boolean;
  event: IPaymentWebhookEvent | null;
  isDuplicate: boolean;
}

export class PaymentRepository {
  /**
   * Atomically claims a webhook event for processing.
   *
   * Race-Safety Invariant:
   * Uses the MongoDB unique compound index { eventId: 1, provider: 1 } to guarantee
   * that concurrent identical webhook deliveries cannot both enter business processing.
   * If an E11000 duplicate key collision occurs, the second worker thread yields immediately.
   */
  public async claimEvent(
    eventId: string,
    provider: PaymentProviderType,
    eventType: string,
    gatewayOrderId?: string,
    gatewayPaymentId?: string,
    payloadSummary: Record<string, unknown> = {}
  ): Promise<ClaimEventResult> {
    try {
      const event = await PaymentWebhookEvent.create({
        eventId,
        provider,
        eventType,
        gatewayOrderId,
        gatewayPaymentId,
        payloadSummary,
        status: PAYMENT_WEBHOOK_STATUS.PROCESSING,
        retryable: false,
      });

      return { claimed: true, event, isDuplicate: false };
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        // Duplicate key collision
        logger.info(
          { eventId, provider, eventType },
          'Webhook event already claimed or processed (E11000 collision)'
        );

        const existing = await PaymentWebhookEvent.findOne({ eventId, provider });

        // If the prior attempt ended in a retryable transient failure, allow re-claiming
        if (existing && existing.retryable && existing.status === PAYMENT_WEBHOOK_STATUS.FAILED) {
          const reclaimed = await PaymentWebhookEvent.findOneAndUpdate(
            {
              _id: existing._id,
              status: PAYMENT_WEBHOOK_STATUS.FAILED,
              retryable: true,
            },
            {
              $set: {
                status: PAYMENT_WEBHOOK_STATUS.PROCESSING,
                errorMessage: undefined,
                retryable: false,
              },
            },
            { new: true }
          );

          if (reclaimed) {
            logger.info({ eventId, provider }, 'Reclaimed retryable failed webhook event');
            return { claimed: true, event: reclaimed, isDuplicate: false };
          }
        }

        return { claimed: false, event: existing, isDuplicate: true };
      }

      throw err;
    }
  }

  /**
   * Updates status and metadata of a webhook event record.
   */
  public async updateEventStatus(
    eventId: string,
    provider: PaymentProviderType,
    status: PaymentWebhookStatus,
    options: {
      errorMessage?: string;
      retryable?: boolean;
      processedAt?: Date;
    } = {}
  ): Promise<IPaymentWebhookEvent | null> {
    return PaymentWebhookEvent.findOneAndUpdate(
      { eventId, provider },
      {
        $set: {
          status,
          errorMessage: options.errorMessage,
          retryable: options.retryable ?? false,
          ...(options.processedAt ? { processedAt: options.processedAt } : {}),
        },
      },
      { new: true }
    );
  }

  /**
   * Look up a webhook event record by eventId and provider.
   */
  public async findEvent(
    eventId: string,
    provider: PaymentProviderType
  ): Promise<IPaymentWebhookEvent | null> {
    return PaymentWebhookEvent.findOne({ eventId, provider });
  }
}

export const paymentRepository = new PaymentRepository();
