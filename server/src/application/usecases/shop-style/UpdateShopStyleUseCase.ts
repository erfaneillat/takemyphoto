import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { ShopStyle, UpdateShopStyleDTO } from '@core/domain/entities/ShopStyle';

export class UpdateShopStyleUseCase {
    constructor(private shopStyleRepository: IShopStyleRepository) { }

    async execute(id: string, data: UpdateShopStyleDTO): Promise<ShopStyle | null> {
        if (data.slug) {
            const exists = await this.shopStyleRepository.exists(data.slug, id);
            if (exists) {
                throw new Error(`Style with slug "${data.slug}" already exists`);
            }
        }
        return this.shopStyleRepository.update(id, data);
    }
}
