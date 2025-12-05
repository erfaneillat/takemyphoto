import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateCheckoutOrderUseCase } from '@application/usecases/checkout/CreateCheckoutOrderUseCase';
import { InitiateZarinpalPaymentUseCase } from '@application/usecases/payment/InitiateZarinpalPaymentUseCase';
import { VerifyZarinpalPaymentUseCase } from '@application/usecases/payment/VerifyZarinpalPaymentUseCase';

export class ZarinpalController {
    constructor(
        private createCheckoutOrderUseCase: CreateCheckoutOrderUseCase,
        private initiateZarinpalPaymentUseCase: InitiateZarinpalPaymentUseCase,
        private verifyZarinpalPaymentUseCase: VerifyZarinpalPaymentUseCase
    ) { }

    submitCheckoutForm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            postalCode,
            amount,
            description = 'خرید اشتراک',
            planId,
            billingCycle
        } = req.body;

        // Validation - either email or phone is required
        if (!email && !phone) {
            res.status(400).json({
                status: 'error',
                message: 'ایمیل یا شماره موبایل الزامی است'
            });
            return;
        }

        // Email validation - optional but must be valid if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    status: 'error',
                    message: 'فرمت ایمیل صحیح نیست'
                });
                return;
            }
        }

        // Phone validation (Iranian format) - optional but must be valid if provided
        if (phone) {
            const phoneRegex = /^(\+98|0)?9\d{9}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                res.status(400).json({
                    status: 'error',
                    message: 'شماره موبایل صحیح نیست'
                });
                return;
            }
        }

        // Amount validation (must be in Rials, minimum 10000 Rials)
        if (!amount || amount < 10000) {
            res.status(400).json({
                status: 'error',
                message: 'مبلغ پرداخت صحیح نیست (حداقل ۱۰,۰۰۰ ریال)'
            });
            return;
        }

        // Save checkout order to database
        const checkoutOrder = await this.createCheckoutOrderUseCase.execute({
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            phone: phone || '',
            address: address || '',
            postalCode: postalCode || '',
            planId,
            billingCycle
        });

        console.log('Zarinpal checkout form submission saved:', checkoutOrder.id);

        try {
            // Get callback URL from environment or request
            const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
            const callbackUrl = `${apiBaseUrl}/api/v1/zarinpal/verify`;

            // Initiate payment with Zarinpal
            const paymentResult = await this.initiateZarinpalPaymentUseCase.execute({
                orderId: checkoutOrder.id,
                amount: Math.round(amount), // Ensure integer for Rials
                description: `${description} - ${planId || 'اشتراک'} - ${billingCycle || ''}`,
                callbackUrl,
                userId: (req as any).user?.id
            });

            res.status(200).json({
                status: 'success',
                message: 'درخواست پرداخت ایجاد شد',
                data: {
                    orderId: checkoutOrder.id,
                    paymentId: paymentResult.paymentId,
                    authority: paymentResult.authority,
                    paymentUrl: paymentResult.paymentUrl
                }
            });
        } catch (error: any) {
            console.error('Zarinpal payment initiation error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'خطا در ایجاد درخواست پرداخت',
                data: { orderId: checkoutOrder.id }
            });
        }
    });

    verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        // Zarinpal sends Authority and Status as query params
        const authority = req.query.Authority as string;
        const status = req.query.Status as string;

        if (!authority) {
            res.status(400).json({
                status: 'error',
                message: 'پارامتر Authority الزامی است'
            });
            return;
        }

        try {
            // Verify payment with Zarinpal
            const result = await this.verifyZarinpalPaymentUseCase.execute({
                authority,
                status: status || 'NOK'
            });

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

            if (result.success) {
                // Redirect to success page
                res.redirect(`${frontendUrl}/payment/success?refId=${result.refId}&orderId=${result.orderId}`);
            } else {
                // Redirect to failure page
                res.redirect(`${frontendUrl}/payment/failed?message=${encodeURIComponent(result.message)}&orderId=${result.orderId}`);
            }
        } catch (error: any) {
            console.error('Zarinpal payment verification error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/payment/failed?message=${encodeURIComponent(error.message)}`);
        }
    });
}
