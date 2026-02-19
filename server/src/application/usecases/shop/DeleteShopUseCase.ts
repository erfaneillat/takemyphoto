import { IShopRepository } from '@core/domain/repositories/IShopRepository';

export class DeleteShopUseCase {
    constructor(private shopRepository: IShopRepository) { }

    async execute(id: string): Promise<boolean> {
        return await this.shopRepository.delete(id);
    }
}
