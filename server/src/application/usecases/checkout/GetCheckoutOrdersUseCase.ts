import { CheckoutOrder } from '@core/domain/entities/CheckoutOrder';
import { CheckoutOrderRepository } from '@infrastructure/database/repositories/CheckoutOrderRepository';

export class GetCheckoutOrdersUseCase {
  constructor(private checkoutOrderRepository: CheckoutOrderRepository) {}

  async execute(page: number, limit: number): Promise<{
    orders: CheckoutOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.checkoutOrderRepository.findAll(page, limit);
  }
}
