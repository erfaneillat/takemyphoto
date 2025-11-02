import { CheckoutOrder, UpdateCheckoutOrderDTO } from '@core/domain/entities/CheckoutOrder';
import { CheckoutOrderRepository } from '@infrastructure/database/repositories/CheckoutOrderRepository';

export class UpdateCheckoutOrderStatusUseCase {
  constructor(private checkoutOrderRepository: CheckoutOrderRepository) {}

  async execute(id: string, dto: UpdateCheckoutOrderDTO): Promise<CheckoutOrder | null> {
    return await this.checkoutOrderRepository.update(id, dto);
  }
}
