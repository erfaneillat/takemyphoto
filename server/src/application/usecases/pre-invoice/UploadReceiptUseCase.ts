import { IPreInvoiceRepository } from '../../../core/domain/repositories/IPreInvoiceRepository';
import { PreInvoice, PreInvoiceStatus } from '../../../core/domain/entities/PreInvoice';

export class UploadReceiptUseCase {
    constructor(private preInvoiceRepository: IPreInvoiceRepository) { }

    async execute(invoiceId: string, receiptImageUrl: string): Promise<PreInvoice> {
        const invoice = await this.preInvoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new Error('Pre-invoice not found');
        }

        const updated = await this.preInvoiceRepository.update(invoiceId, {
            receiptImageUrl,
            status: PreInvoiceStatus.PAID
        });

        if (!updated) {
            throw new Error('Failed to update pre-invoice');
        }

        return updated;
    }
}
