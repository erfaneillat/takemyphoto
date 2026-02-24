import { IPreInvoiceRepository } from '../../../core/domain/repositories/IPreInvoiceRepository';
import { PreInvoice, CreatePreInvoiceDTO } from '../../../core/domain/entities/PreInvoice';
import { IShopRepository } from '../../../core/domain/repositories/IShopRepository';

export class CreatePreInvoiceUseCase {
    constructor(
        private preInvoiceRepository: IPreInvoiceRepository,
        private shopRepository: IShopRepository
    ) { }

    async execute(data: CreatePreInvoiceDTO): Promise<PreInvoice> {
        const shop = await this.shopRepository.findById(data.shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        return this.preInvoiceRepository.create(data);
    }
}
