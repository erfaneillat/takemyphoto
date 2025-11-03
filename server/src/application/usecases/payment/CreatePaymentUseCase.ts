import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { CreatePaymentDTO, Payment } from '@core/domain/entities/Payment';

export class CreatePaymentUseCase {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute(data: CreatePaymentDTO): Promise<Payment> {
    return await this.paymentRepository.create(data);
  }
}
