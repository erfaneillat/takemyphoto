import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';
import { ShopCategory } from '@core/domain/entities/ShopCategory';

export class GetShopCategoriesUseCase {
    constructor(private shopCategoryRepository: IShopCategoryRepository) { }

    async execute(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopCategory[]> {
        return await this.shopCategoryRepository.findAll(filters);
    }
}
