import { CheckoutOrder, CreateCheckoutOrderDTO, UpdateCheckoutOrderDTO } from '../entities/CheckoutOrder';

export interface ICheckoutOrderRepository {
  create(dto: CreateCheckoutOrderDTO): Promise<CheckoutOrder>;
  findById(id: string): Promise<CheckoutOrder | null>;
  findAll(page: number, limit: number): Promise<{ orders: CheckoutOrder[]; total: number; page: number; totalPages: number }>;
  update(id: string, dto: UpdateCheckoutOrderDTO): Promise<CheckoutOrder | null>;
  updateStatus(id: string, dto: UpdateCheckoutOrderDTO): Promise<CheckoutOrder | null>;
  delete(id: string): Promise<boolean>;
}
