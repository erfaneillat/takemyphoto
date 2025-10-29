import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete category');
    }
  }
}
