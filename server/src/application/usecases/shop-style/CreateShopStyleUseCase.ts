import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { ShopStyle, CreateShopStyleDTO } from '@core/domain/entities/ShopStyle';

export class CreateShopStyleUseCase {
    constructor(private shopStyleRepository: IShopStyleRepository) { }

    async execute(data: CreateShopStyleDTO): Promise<ShopStyle> {
        const exists = await this.shopStyleRepository.exists(data.slug);
        if (exists) {
            throw new Error(`Style with slug "${data.slug}" already exists`);
        }
        return this.shopStyleRepository.create(data);
    }
}
