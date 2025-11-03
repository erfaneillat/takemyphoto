import { IPaymentRepository } from '@core/domain/repositories/IPaymentRepository';
import { Payment, CreatePaymentDTO, UpdatePaymentDTO } from '@core/domain/entities/Payment';
import { PaymentModel } from '../models/PaymentModel';

export class PaymentRepository implements IPaymentRepository {
  async create(data: CreatePaymentDTO): Promise<Payment> {
    const payment = await PaymentModel.create(data);
    return this.mapToEntity(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await PaymentModel.findById(id);
    return payment ? this.mapToEntity(payment) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ orderId });
    return payment ? this.mapToEntity(payment) : null;
  }

  async findByAuthority(authority: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ authority });
    return payment ? this.mapToEntity(payment) : null;
  }

  async update(id: string, data: UpdatePaymentDTO): Promise<Payment | null> {
    const payment = await PaymentModel.findByIdAndUpdate(id, data, { new: true });
    return payment ? this.mapToEntity(payment) : null;
  }

  async findAll(page: number, limit: number): Promise<{ payments: Payment[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      PaymentModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      PaymentModel.countDocuments()
    ]);

    return {
      payments: payments.map(this.mapToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  private mapToEntity(doc: any): Payment {
    return {
      id: doc._id.toString(),
      orderId: doc.orderId,
      userId: doc.userId,
      amount: doc.amount,
      fromCurrencyCode: doc.fromCurrencyCode,
      toCurrencyCode: doc.toCurrencyCode,
      authority: doc.authority,
      reference: doc.reference,
      gateway: doc.gateway,
      status: doc.status,
      description: doc.description,
      errorMessage: doc.errorMessage,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
