import { IContactMessageRepository } from '@core/domain/repositories/IContactMessageRepository';
import { ContactMessage } from '@core/domain/entities/ContactMessage';

export class GetContactMessagesUseCase {
  constructor(private contactMessageRepository: IContactMessageRepository) {}

  async execute(page: number = 1, limit: number = 20): Promise<{ messages: ContactMessage[]; total: number; pages: number }> {
    const { messages, total } = await this.contactMessageRepository.findAll(page, limit);
    const pages = Math.ceil(total / limit);
    
    return {
      messages,
      total,
      pages
    };
  }
}
