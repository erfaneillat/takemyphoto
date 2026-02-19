import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { Shop } from '@core/domain/entities/Shop';

export class GetShopsUseCase {
    constructor(private shopRepository: IShopRepository) { }

    async execute(): Promise<Shop[]> {
        return await this.shopRepository.findAll();
    }
}
