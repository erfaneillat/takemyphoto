import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { ShopStyle } from '@core/domain/entities/ShopStyle';

export class GetShopStylesUseCase {
    constructor(private shopStyleRepository: IShopStyleRepository) { }

    async execute(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopStyle[]> {
        return this.shopStyleRepository.findAll(filters);
    }
}
