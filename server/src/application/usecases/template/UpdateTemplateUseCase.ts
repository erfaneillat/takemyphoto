import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { UpdateTemplateDTO, Template } from '@core/domain/entities/Template';

export class UpdateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string, data: UpdateTemplateDTO): Promise<Template> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updated = await this.templateRepository.update(id, data);
    if (!updated) {
      throw new Error('Failed to update template');
    }

    return updated;
  }
}
