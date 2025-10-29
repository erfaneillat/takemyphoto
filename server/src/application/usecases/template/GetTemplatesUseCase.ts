import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { Template } from '@core/domain/entities/Template';

export interface GetTemplatesInput {
  category?: string;
  search?: string;
  trending?: boolean;
  limit?: number;
  offset?: number;
}

export class GetTemplatesUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(input: GetTemplatesInput): Promise<Template[]> {
    const { category, search, trending, limit = 50, offset = 0 } = input;

    if (trending) {
      return await this.templateRepository.findTrending(limit);
    }

    if (search) {
      return await this.templateRepository.search(search, limit, offset);
    }

    if (category) {
      return await this.templateRepository.findByCategory(category, limit, offset);
    }

    return await this.templateRepository.findAll(limit, offset);
  }
}
