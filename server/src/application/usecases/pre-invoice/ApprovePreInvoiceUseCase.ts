import { IPreInvoiceRepository } from '../../../core/domain/repositories/IPreInvoiceRepository';
import { IShopRepository } from '../../../core/domain/repositories/IShopRepository';
import { PreInvoice, PreInvoiceStatus } from '../../../core/domain/entities/PreInvoice';

export class ApprovePreInvoiceUseCase {
    constructor(
        private preInvoiceRepository: IPreInvoiceRepository,
        private shopRepository: IShopRepository
    ) { }

    async execute(invoiceId: string): Promise<PreInvoice> {
        const invoice = await this.preInvoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new Error('Pre-invoice not found');
        }

        if (invoice.status === PreInvoiceStatus.APPROVED) {
            return invoice;
        }

        const shop = await this.shopRepository.findById(invoice.shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + invoice.durationMonths);

        // Update the shop
        await this.shopRepository.update(shop.id, {
            isActivated: true,
            activatedAt: new Date(),
            licenseDurationMonths: invoice.durationMonths,
            licenseExpiresAt: expirationDate,
            credit: invoice.creditCount,
        });

        // Update the invoice status
        const updated = await this.preInvoiceRepository.update(invoiceId, {
            status: PreInvoiceStatus.APPROVED
        });

        if (!updated) {
            throw new Error('Failed to update pre-invoice');
        }

        return updated;
    }
}
