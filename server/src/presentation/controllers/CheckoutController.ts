import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateCheckoutOrderUseCase } from '@application/usecases/checkout/CreateCheckoutOrderUseCase';
import { GetCheckoutOrdersUseCase } from '@application/usecases/checkout/GetCheckoutOrdersUseCase';
import { UpdateCheckoutOrderStatusUseCase } from '@application/usecases/checkout/UpdateCheckoutOrderStatusUseCase';
import { DeleteCheckoutOrderUseCase } from '@application/usecases/checkout/DeleteCheckoutOrderUseCase';
import { InitiatePaymentUseCase } from '@application/usecases/payment/InitiatePaymentUseCase';
import { VerifyPaymentUseCase } from '@application/usecases/payment/VerifyPaymentUseCase';
import { Currency } from '@core/domain/entities/Payment';

export class CheckoutController {
  constructor(
    private createCheckoutOrderUseCase: CreateCheckoutOrderUseCase,
    private getCheckoutOrdersUseCase: GetCheckoutOrdersUseCase,
    private updateCheckoutOrderStatusUseCase: UpdateCheckoutOrderStatusUseCase,
    private deleteCheckoutOrderUseCase: DeleteCheckoutOrderUseCase,
    private initiatePaymentUseCase: InitiatePaymentUseCase,
    private verifyPaymentUseCase: VerifyPaymentUseCase
  ) {}

  submitCheckoutForm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      postalCode,
      amount,
      fromCurrencyCode = Currency.EUR,
      toCurrencyCode = Currency.EUR,
      country = 'Iran',
      city = 'Tehran',
      description = 'Subscription Payment',
      planId,
      billingCycle
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !address || !postalCode) {
      res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
      return;
    }

    // Phone validation (simple check for numbers)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid phone number format'
      });
      return;
    }

    // Postal code validation (basic check for alphanumeric)
    if (postalCode.length < 5) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid postal code'
      });
      return;
    }

    // Amount validation
    if (!amount || amount <= 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payment amount'
      });
      return;
    }

    // Save checkout order to database
    const checkoutOrder = await this.createCheckoutOrderUseCase.execute({
      firstName,
      lastName,
      email,
      phone,
      address,
      postalCode
    });

    console.log('Checkout form submission saved:', checkoutOrder.id);

    try {
      // Get callback URL from environment or request
      const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const callbackUrl = `${apiBaseUrl}/api/v1/checkout/verify`;

      // Initiate payment with Yekpay
      const paymentResult = await this.initiatePaymentUseCase.execute({
        orderId: checkoutOrder.id,
        amount: parseFloat(amount),
        fromCurrencyCode,
        toCurrencyCode,
        country,
        city,
        description: `${description} - ${planId || 'Order'} - ${billingCycle || ''}`,
        callbackUrl,
        userId: (req as any).user?.id
      });

      res.status(200).json({
        status: 'success',
        message: 'Payment initiated successfully',
        data: {
          orderId: checkoutOrder.id,
          paymentId: paymentResult.paymentId,
          authority: paymentResult.authority,
          paymentUrl: paymentResult.paymentUrl
        }
      });
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to initiate payment',
        data: { orderId: checkoutOrder.id }
      });
    }
  });

  getCheckoutOrders = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.getCheckoutOrdersUseCase.execute(page, limit);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  updateCheckoutStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
      return;
    }

    const updated = await this.updateCheckoutOrderStatusUseCase.execute(id, { status });

    if (!updated) {
      res.status(404).json({
        status: 'error',
        message: 'Checkout order not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updated
    });
  });

  deleteCheckoutOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleted = await this.deleteCheckoutOrderUseCase.execute(id);

    if (!deleted) {
      res.status(404).json({
        status: 'error',
        message: 'Checkout order not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Checkout order deleted successfully'
    });
  });

  verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { success, authority } = req.query;

    if (!authority || typeof authority !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Authority parameter is required'
      });
      return;
    }

    // Check if payment was cancelled by user
    if (success === '0') {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancelled?authority=${authority}`);
      return;
    }

    try {
      // Verify payment with Yekpay
      const result = await this.verifyPaymentUseCase.execute({ authority });

      if (result.success) {
        // Redirect to success page
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?reference=${result.reference}&orderId=${result.orderId}`);
      } else {
        // Redirect to failure page
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}&orderId=${result.orderId}`);
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(error.message)}`);
    }
  });
}
