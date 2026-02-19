import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';
import { CreateShopCategoryDTO, ShopCategory } from '@core/domain/entities/ShopCategory';

export class CreateShopCategoryUseCase {
    constructor(private shopCategoryRepository: IShopCategoryRepository) { }

    async execute(data: CreateShopCategoryDTO): Promise<ShopCategory> {
        const exists = await this.shopCategoryRepository.exists(data.slug);
        if (exists) {
            throw new Error('Shop category with this slug already exists');
        }

        return await this.shopCategoryRepository.create(data);
    }
}
