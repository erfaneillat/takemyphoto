import { Payment, CreatePaymentDTO, UpdatePaymentDTO } from '../entities/Payment';

export interface IPaymentRepository {
  create(data: CreatePaymentDTO): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  findByAuthority(authority: string): Promise<Payment | null>;
  update(id: string, data: UpdatePaymentDTO): Promise<Payment | null>;
  findAll(page: number, limit: number): Promise<{ payments: Payment[]; total: number; page: number; limit: number; totalPages: number }>;
}
