import { IContactMessageRepository } from '@core/domain/repositories/IContactMessageRepository';
import { ContactMessage, CreateContactMessageDTO } from '@core/domain/entities/ContactMessage';

export class CreateContactMessageUseCase {
  constructor(private contactMessageRepository: IContactMessageRepository) {}

  async execute(data: CreateContactMessageDTO): Promise<ContactMessage> {
    return await this.contactMessageRepository.create(data);
  }
}
