import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';

export class DeleteTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string): Promise<void> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const deleted = await this.templateRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete template');
    }
  }
}
