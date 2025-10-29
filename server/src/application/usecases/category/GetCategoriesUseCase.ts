import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';
import { Category } from '@core/domain/entities/Category';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(isActive?: boolean): Promise<Category[]> {
    return await this.categoryRepository.findAll({ isActive });
  }
}
