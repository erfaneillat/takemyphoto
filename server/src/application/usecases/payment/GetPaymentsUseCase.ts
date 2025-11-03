import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { Payment } from '@core/domain/entities/Payment';

export class GetPaymentsUseCase {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute(page: number = 1, limit: number = 20): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.paymentRepository.findAll(page, limit);
  }
}
