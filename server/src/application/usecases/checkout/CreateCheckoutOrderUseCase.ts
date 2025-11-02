import { CheckoutOrder, CreateCheckoutOrderDTO } from '@core/domain/entities/CheckoutOrder';
import { CheckoutOrderRepository } from '@infrastructure/database/repositories/CheckoutOrderRepository';

export class CreateCheckoutOrderUseCase {
  constructor(private checkoutOrderRepository: CheckoutOrderRepository) {}

  async execute(dto: CreateCheckoutOrderDTO): Promise<CheckoutOrder> {
    return await this.checkoutOrderRepository.create(dto);
  }
}
