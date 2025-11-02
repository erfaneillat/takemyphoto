import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateCheckoutOrderUseCase } from '@application/usecases/checkout/CreateCheckoutOrderUseCase';
import { GetCheckoutOrdersUseCase } from '@application/usecases/checkout/GetCheckoutOrdersUseCase';
import { UpdateCheckoutOrderStatusUseCase } from '@application/usecases/checkout/UpdateCheckoutOrderStatusUseCase';
import { DeleteCheckoutOrderUseCase } from '@application/usecases/checkout/DeleteCheckoutOrderUseCase';

export class CheckoutController {
  constructor(
    private createCheckoutOrderUseCase: CreateCheckoutOrderUseCase,
    private getCheckoutOrdersUseCase: GetCheckoutOrdersUseCase,
    private updateCheckoutOrderStatusUseCase: UpdateCheckoutOrderStatusUseCase,
    private deleteCheckoutOrderUseCase: DeleteCheckoutOrderUseCase
  ) {}

  submitCheckoutForm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, phone, address, postalCode } = req.body;

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

    // Save to database
    const checkoutOrder = await this.createCheckoutOrderUseCase.execute({
      firstName,
      lastName,
      email,
      phone,
      address,
      postalCode
    });

    console.log('Checkout form submission saved:', checkoutOrder.id);

    // TODO: Implement order processing logic here
    // Example: await this.orderProcessingService.processOrder(checkoutOrder);

    res.status(200).json({
      status: 'success',
      message: 'Checkout form submitted successfully',
      data: checkoutOrder
    });
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
}
