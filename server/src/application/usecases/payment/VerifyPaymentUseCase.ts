import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { ICheckoutOrderRepository } from '@core/domain/repositories/ICheckoutOrderRepository';
import { YekpayService } from '@application/services/YekpayService';
import { PaymentStatus } from '@core/domain/entities/Payment';
import { OrderStatus } from '@core/domain/entities/CheckoutOrder';

export interface VerifyPaymentInput {
  authority: string;
}

export interface VerifyPaymentOutput {
  success: boolean;
  reference?: string;
  gateway?: string;
  amount?: number;
  message: string;
  orderId?: string;
}

export class VerifyPaymentUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private checkoutOrderRepository: ICheckoutOrderRepository,
    private yekpayService: YekpayService
  ) {}

  async execute(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
    // Find payment by authority
    const payment = await this.paymentRepository.findByAuthority(input.authority);
    if (!payment) {
      return {
        success: false,
        message: 'Payment not found'
      };
    }

    // Check if already verified
    if (payment.status === PaymentStatus.COMPLETED) {
      return {
        success: true,
        reference: payment.reference,
        gateway: payment.gateway,
        amount: payment.amount,
        message: 'Payment already verified',
        orderId: payment.orderId
      };
    }

    try {
      // Verify payment with Yekpay
      const verifyResponse = await this.yekpayService.verifyPayment(input.authority);

      // Check verification response
      if (verifyResponse.Code !== 100) {
        const errorMessage = this.yekpayService.getErrorDescription(verifyResponse.Code);

        // Update payment status
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatus.FAILED,
          errorMessage: errorMessage
        });

        return {
          success: false,
          message: errorMessage,
          orderId: payment.orderId
        };
      }

      // Update payment with success
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.COMPLETED,
        reference: verifyResponse.Reference,
        gateway: verifyResponse.Gateway,
        metadata: {
          orderNo: verifyResponse.OrderNo,
          amount: verifyResponse.Amount
        }
      });

      // Update checkout order status to completed
      await this.checkoutOrderRepository.updateStatus(payment.orderId, {
        status: OrderStatus.COMPLETED
      });

      return {
        success: true,
        reference: verifyResponse.Reference,
        gateway: verifyResponse.Gateway,
        amount: verifyResponse.Amount,
        message: 'Payment verified successfully',
        orderId: payment.orderId
      };
    } catch (error: any) {
      // Update payment status
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
        errorMessage: error.message
      });

      return {
        success: false,
        message: error.message,
        orderId: payment.orderId
      };
    }
  }
}
