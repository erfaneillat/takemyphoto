import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';

export class DeleteShopStyleUseCase {
    constructor(private shopStyleRepository: IShopStyleRepository) { }

    async execute(id: string): Promise<boolean> {
        return this.shopStyleRepository.delete(id);
    }
}
