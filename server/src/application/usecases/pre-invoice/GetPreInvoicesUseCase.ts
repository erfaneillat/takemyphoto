import { IPreInvoiceRepository } from '../../../core/domain/repositories/IPreInvoiceRepository';
import { PreInvoice } from '../../../core/domain/entities/PreInvoice';

export class GetPreInvoicesUseCase {
    constructor(private preInvoiceRepository: IPreInvoiceRepository) { }

    async getAll(): Promise<PreInvoice[]> {
        return this.preInvoiceRepository.findAll();
    }

    async getByShopId(shopId: string): Promise<PreInvoice[]> {
        return this.preInvoiceRepository.findByShopId(shopId);
    }
}
