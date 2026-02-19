import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';

export class DeleteShopCategoryUseCase {
    constructor(private shopCategoryRepository: IShopCategoryRepository) { }

    async execute(id: string): Promise<void> {
        const category = await this.shopCategoryRepository.findById(id);
        if (!category) {
            throw new Error('Shop category not found');
        }

        const deleted = await this.shopCategoryRepository.delete(id);
        if (!deleted) {
            throw new Error('Failed to delete shop category');
        }
    }
}
