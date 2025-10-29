import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { CreateTemplateDTO, Template } from '@core/domain/entities/Template';

export class CreateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(data: CreateTemplateDTO): Promise<Template> {
    return await this.templateRepository.create(data);
  }
}
