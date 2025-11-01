import { IContactMessageRepository } from '@core/domain/repositories/IContactMessageRepository';

export class DeleteContactMessageUseCase {
  constructor(private contactMessageRepository: IContactMessageRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.contactMessageRepository.delete(id);
  }
}
