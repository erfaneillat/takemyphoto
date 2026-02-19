import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';
import { UpdateShopCategoryDTO, ShopCategory } from '@core/domain/entities/ShopCategory';

export class UpdateShopCategoryUseCase {
    constructor(private shopCategoryRepository: IShopCategoryRepository) { }

    async execute(id: string, data: UpdateShopCategoryDTO): Promise<ShopCategory> {
        const category = await this.shopCategoryRepository.findById(id);
        if (!category) {
            throw new Error('Shop category not found');
        }

        if (data.slug && data.slug !== category.slug) {
            const exists = await this.shopCategoryRepository.exists(data.slug, id);
            if (exists) {
                throw new Error('Shop category with this slug already exists');
            }
        }

        const updated = await this.shopCategoryRepository.update(id, data);
        if (!updated) {
            throw new Error('Failed to update shop category');
        }

        return updated;
    }
}
