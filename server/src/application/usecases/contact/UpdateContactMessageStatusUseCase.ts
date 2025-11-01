import { IContactMessageRepository } from '@core/domain/repositories/IContactMessageRepository';
import { ContactMessage, UpdateContactMessageDTO } from '@core/domain/entities/ContactMessage';

export class UpdateContactMessageStatusUseCase {
  constructor(private contactMessageRepository: IContactMessageRepository) {}

  async execute(id: string, data: UpdateContactMessageDTO): Promise<ContactMessage | null> {
    return await this.contactMessageRepository.update(id, data);
  }
}
