import { IContactMessageRepository } from '@core/domain/repositories/IContactMessageRepository';
import { ContactMessage, CreateContactMessageDTO, UpdateContactMessageDTO } from '@core/domain/entities/ContactMessage';
import { ContactMessageModel } from '../models/ContactMessageModel';

export class ContactMessageRepository implements IContactMessageRepository {
  async create(data: CreateContactMessageDTO): Promise<ContactMessage> {
    const message = await ContactMessageModel.create(data);
    return message.toJSON() as ContactMessage;
  }

  async findById(id: string): Promise<ContactMessage | null> {
    const message = await ContactMessageModel.findById(id);
    return message ? (message.toJSON() as ContactMessage) : null;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ messages: ContactMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      ContactMessageModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessageModel.countDocuments()
    ]);

    return {
      messages: messages.map(msg => ({
        ...msg,
        id: msg._id.toString(),
        _id: undefined,
        __v: undefined
      })) as ContactMessage[],
      total
    };
  }

  async update(id: string, data: UpdateContactMessageDTO): Promise<ContactMessage | null> {
    const message = await ContactMessageModel.findByIdAndUpdate(id, data, { new: true });
    return message ? (message.toJSON() as ContactMessage) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ContactMessageModel.findByIdAndDelete(id);
    return !!result;
  }
}
