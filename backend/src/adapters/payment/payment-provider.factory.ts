import { IPaymentProvider, PaymentProviderType } from '../../types/payment.types.js';
import { razorpayAdapter } from './razorpay.adapter.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/index.js';

export class PaymentProviderFactory {
  public static getProvider(provider: PaymentProviderType): IPaymentProvider {
    switch (provider) {
      case 'razorpay':
        return razorpayAdapter;
      case 'stripe':
        throw new AppError(
          'Stripe payment gateway is currently deferred for Phase 4.5B.',
          HTTP_STATUS.BAD_REQUEST
        );
      default:
        throw new AppError(
          `Unsupported payment provider: ${String(provider)}`,
          HTTP_STATUS.BAD_REQUEST
        );
    }
  }
}
