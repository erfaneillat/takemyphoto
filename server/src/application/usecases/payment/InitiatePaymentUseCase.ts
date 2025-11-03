import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { ICheckoutOrderRepository } from '@core/domain/repositories/ICheckoutOrderRepository';
import { YekpayService } from '@application/services/YekpayService';
import { Currency, PaymentStatus } from '@core/domain/entities/Payment';

export interface InitiatePaymentInput {
  orderId: string;
  amount: number;
  fromCurrencyCode: Currency;
  toCurrencyCode: Currency;
  country: string;
  city: string;
  description: string;
  callbackUrl: string;
  userId?: string;
}

export interface InitiatePaymentOutput {
  paymentId: string;
  authority: string;
  paymentUrl: string;
  message: string;
}

export class InitiatePaymentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private checkoutOrderRepository: ICheckoutOrderRepository,
    private yekpayService: YekpayService
  ) {}

  async execute(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    // Get checkout order details
    const order = await this.checkoutOrderRepository.findById(input.orderId);
    if (!order) {
      throw new Error('Checkout order not found');
    }

    // Create payment record
    const payment = await this.paymentRepository.create({
      orderId: input.orderId,
      userId: input.userId,
      amount: input.amount,
      fromCurrencyCode: input.fromCurrencyCode,
      toCurrencyCode: input.toCurrencyCode,
      description: input.description
    });

    try {
      // Request payment from Yekpay
      const yekpayResponse = await this.yekpayService.requestPayment({
        fromCurrencyCode: input.fromCurrencyCode,
        toCurrencyCode: input.toCurrencyCode,
        email: order.email,
        mobile: order.phone,
        firstName: order.firstName,
        lastName: order.lastName,
        address: order.address,
        postalCode: order.postalCode,
        country: input.country,
        city: input.city,
        description: input.description,
        amount: input.amount.toFixed(2),
        orderNumber: input.orderId,
        callback: input.callbackUrl
      });

      // Check response code
      if (yekpayResponse.Code !== 100) {
        const errorMessage = this.yekpayService.getErrorDescription(yekpayResponse.Code);
        
        // Update payment with error
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatus.FAILED,
          errorMessage: errorMessage
        });

        throw new Error(errorMessage);
      }

      // Update payment with authority
      await this.paymentRepository.update(payment.id, {
        authority: yekpayResponse.Authority,
        status: PaymentStatus.PROCESSING
      });

      // Get payment URL
      const paymentUrl = this.yekpayService.getPaymentUrl(yekpayResponse.Authority);

      return {
        paymentId: payment.id,
        authority: yekpayResponse.Authority,
        paymentUrl,
        message: 'Payment initiated successfully'
      };
    } catch (error: any) {
      // Update payment status to failed
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
        errorMessage: error.message
      });

      throw error;
    }
  }
}
