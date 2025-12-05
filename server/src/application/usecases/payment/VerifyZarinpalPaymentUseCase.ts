import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { ICheckoutOrderRepository } from '@core/domain/repositories/ICheckoutOrderRepository';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { ZarinpalService } from '@application/services/ZarinpalService';
import { PaymentStatus } from '@core/domain/entities/Payment';
import { OrderStatus } from '@core/domain/entities/CheckoutOrder';
import { SubscriptionTier } from '@core/domain/entities/User';

export interface VerifyZarinpalPaymentInput {
    authority: string;
    status: string; // 'OK' or 'NOK' from Zarinpal callback
}

export interface VerifyZarinpalPaymentOutput {
    success: boolean;
    refId?: number;
    cardPan?: string;
    message: string;
    orderId?: string;
}

export class VerifyZarinpalPaymentUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
        private checkoutOrderRepository: ICheckoutOrderRepository,
        private userRepository: IUserRepository,
        private zarinpalService: ZarinpalService
    ) { }

    async execute(input: VerifyZarinpalPaymentInput): Promise<VerifyZarinpalPaymentOutput> {
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
                refId: payment.metadata?.ref_id,
                cardPan: payment.metadata?.card_pan,
                message: 'Payment already verified',
                orderId: payment.orderId
            };
        }

        // Check if user cancelled payment
        if (input.status === 'NOK') {
            await this.paymentRepository.update(payment.id, {
                status: PaymentStatus.CANCELLED,
                errorMessage: 'Payment cancelled by user'
            });

            return {
                success: false,
                message: 'پرداخت توسط کاربر لغو شد',
                orderId: payment.orderId
            };
        }

        try {
            // Verify payment with Zarinpal
            const verifyResponse = await this.zarinpalService.verifyPayment(
                input.authority,
                payment.amount
            );

            // Check verification response
            if (!this.zarinpalService.isSuccessCode(verifyResponse.data.code)) {
                const errorMessage = this.zarinpalService.getErrorDescription(verifyResponse.data.code);

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
                reference: verifyResponse.data.ref_id.toString(),
                metadata: {
                    ...payment.metadata,
                    ref_id: verifyResponse.data.ref_id,
                    card_pan: verifyResponse.data.card_pan,
                    card_hash: verifyResponse.data.card_hash,
                    fee: verifyResponse.data.fee,
                    fee_type: verifyResponse.data.fee_type
                }
            });

            // Update checkout order status to completed
            await this.checkoutOrderRepository.updateStatus(payment.orderId, {
                status: OrderStatus.COMPLETED
            });

            // Update user subscription
            const checkoutOrder = await this.checkoutOrderRepository.findById(payment.orderId);
            if (checkoutOrder?.planId) {
                // Map planId to SubscriptionTier
                let subscriptionTier: SubscriptionTier;
                const planIdLower = checkoutOrder.planId.toLowerCase();

                if (planIdLower === 'pro') {
                    subscriptionTier = SubscriptionTier.PRO;
                } else if (planIdLower === 'premium') {
                    subscriptionTier = SubscriptionTier.PREMIUM;
                } else {
                    subscriptionTier = SubscriptionTier.FREE;
                }

                // Determine target userId
                let targetUserId = payment.userId;
                if (!targetUserId && checkoutOrder.email) {
                    const userByEmail = await this.userRepository.findByEmail(checkoutOrder.email);
                    if (userByEmail) {
                        targetUserId = userByEmail.id;
                    }
                }
                if (!targetUserId && checkoutOrder.phone) {
                    const userByPhone = await this.userRepository.findByPhoneNumber(checkoutOrder.phone);
                    if (userByPhone) {
                        targetUserId = userByPhone.id;
                    }
                }

                if (targetUserId) {
                    // Calculate stars to add based on plan and billing cycle
                    let starsToAdd = 0;
                    if (planIdLower === 'pro') {
                        // Pro monthly: 400 stars, Pro yearly: 4800 stars
                        starsToAdd = checkoutOrder.billingCycle === 'yearly' ? 4800 : 400;
                    }

                    // Get current user to add stars
                    const currentUser = await this.userRepository.findById(targetUserId);
                    const currentStars = currentUser?.stars || 0;

                    await this.userRepository.update(targetUserId, {
                        subscription: subscriptionTier,
                        stars: currentStars + starsToAdd
                    });
                    console.log(`Updated user ${targetUserId} subscription to ${subscriptionTier}, added ${starsToAdd} stars (total: ${currentStars + starsToAdd})`);
                }
            }

            return {
                success: true,
                refId: verifyResponse.data.ref_id,
                cardPan: verifyResponse.data.card_pan,
                message: 'پرداخت با موفقیت انجام شد',
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
