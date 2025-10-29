import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';
import { CreateCategoryDTO, Category } from '@core/domain/entities/Category';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: CreateCategoryDTO): Promise<Category> {
    // Check if slug already exists
    const exists = await this.categoryRepository.exists(data.slug);
    if (exists) {
      throw new Error('Category with this slug already exists');
    }

    return await this.categoryRepository.create(data);
  }
}
