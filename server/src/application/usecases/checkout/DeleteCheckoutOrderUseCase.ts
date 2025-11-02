import { CheckoutOrderRepository } from '@infrastructure/database/repositories/CheckoutOrderRepository';

export class DeleteCheckoutOrderUseCase {
  constructor(private checkoutOrderRepository: CheckoutOrderRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.checkoutOrderRepository.delete(id);
  }
}
