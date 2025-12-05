import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { ICheckoutOrderRepository } from '@core/domain/repositories/ICheckoutOrderRepository';
import { ZarinpalService } from '@application/services/ZarinpalService';
import { Currency, PaymentStatus } from '@core/domain/entities/Payment';

export interface InitiateZarinpalPaymentInput {
    orderId: string;
    amount: number; // Amount in Rials
    description: string;
    callbackUrl: string;
    userId?: string;
}

export interface InitiateZarinpalPaymentOutput {
    paymentId: string;
    authority: string;
    paymentUrl: string;
    message: string;
}

export class InitiateZarinpalPaymentUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
        private checkoutOrderRepository: ICheckoutOrderRepository,
        private zarinpalService: ZarinpalService
    ) { }

    async execute(input: InitiateZarinpalPaymentInput): Promise<InitiateZarinpalPaymentOutput> {
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
            fromCurrencyCode: Currency.IRR,
            toCurrencyCode: Currency.IRR,
            description: input.description
        });

        try {
            // Request payment from Zarinpal
            const zarinpalResponse = await this.zarinpalService.requestPayment({
                amount: input.amount,
                description: input.description,
                callbackUrl: input.callbackUrl,
                email: order.email,
                mobile: order.phone
            });

            // Check response code
            if (!this.zarinpalService.isSuccessCode(zarinpalResponse.data.code)) {
                const errorMessage = this.zarinpalService.getErrorDescription(zarinpalResponse.data.code);

                // Update payment with error
                await this.paymentRepository.update(payment.id, {
                    status: PaymentStatus.FAILED,
                    errorMessage: errorMessage
                });

                throw new Error(errorMessage);
            }

            // Update payment with authority
            await this.paymentRepository.update(payment.id, {
                authority: zarinpalResponse.data.authority,
                status: PaymentStatus.PROCESSING,
                gateway: 'zarinpal',
                metadata: {
                    fee: zarinpalResponse.data.fee,
                    fee_type: zarinpalResponse.data.fee_type
                }
            });

            // Get payment URL
            const paymentUrl = this.zarinpalService.getPaymentUrl(zarinpalResponse.data.authority);

            return {
                paymentId: payment.id,
                authority: zarinpalResponse.data.authority,
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
