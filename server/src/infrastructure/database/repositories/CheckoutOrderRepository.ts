import { CheckoutOrder, CreateCheckoutOrderDTO, UpdateCheckoutOrderDTO } from '@core/domain/entities/CheckoutOrder';
import { ICheckoutOrderRepository } from '@core/domain/repositories/ICheckoutOrderRepository';
import { CheckoutOrderModel } from '../models/CheckoutOrderModel';

export class CheckoutOrderRepository implements ICheckoutOrderRepository {
  async create(dto: CreateCheckoutOrderDTO): Promise<CheckoutOrder> {
    const order = new CheckoutOrderModel(dto);
    await order.save();
    return order.toJSON() as CheckoutOrder;
  }

  async findById(id: string): Promise<CheckoutOrder | null> {
    const order = await CheckoutOrderModel.findById(id);
    return order ? (order.toJSON() as CheckoutOrder) : null;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ orders: CheckoutOrder[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      CheckoutOrderModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CheckoutOrderModel.countDocuments()
    ]);

    return {
      orders: orders.map(order => ({
        ...order,
        id: order._id.toString(),
        _id: undefined
      })) as unknown as CheckoutOrder[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, dto: UpdateCheckoutOrderDTO): Promise<CheckoutOrder | null> {
    const order = await CheckoutOrderModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true }
    );
    return order ? (order.toJSON() as CheckoutOrder) : null;
  }

  async updateStatus(id: string, dto: UpdateCheckoutOrderDTO): Promise<CheckoutOrder | null> {
    return this.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    const result = await CheckoutOrderModel.findByIdAndDelete(id);
    return result !== null;
  }
}
