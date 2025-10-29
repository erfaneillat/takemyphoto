import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';
import { UpdateCategoryDTO, Category } from '@core/domain/entities/Category';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if slug is being changed and if it already exists
    if (data.slug && data.slug !== category.slug) {
      const exists = await this.categoryRepository.exists(data.slug, id);
      if (exists) {
        throw new Error('Category with this slug already exists');
      }
    }

    const updated = await this.categoryRepository.update(id, data);
    if (!updated) {
      throw new Error('Failed to update category');
    }

    return updated;
  }
}
