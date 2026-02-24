import { Request, Response } from 'express';
import { CreatePreInvoiceUseCase } from '../../application/usecases/pre-invoice/CreatePreInvoiceUseCase';
import { GetPreInvoicesUseCase } from '../../application/usecases/pre-invoice/GetPreInvoicesUseCase';
import { UploadReceiptUseCase } from '../../application/usecases/pre-invoice/UploadReceiptUseCase';
import { ApprovePreInvoiceUseCase } from '../../application/usecases/pre-invoice/ApprovePreInvoiceUseCase';
import { ZarinpalService } from '../../application/services/ZarinpalService';
import { IPreInvoiceRepository } from '../../core/domain/repositories/IPreInvoiceRepository';
import { PreInvoiceStatus } from '../../core/domain/entities/PreInvoice';
import { IShopRepository } from '../../core/domain/repositories/IShopRepository';

export class PreInvoiceController {
    constructor(
        private createPreInvoiceUseCase: CreatePreInvoiceUseCase,
        private getPreInvoicesUseCase: GetPreInvoicesUseCase,
        private uploadReceiptUseCase: UploadReceiptUseCase,
        private approvePreInvoiceUseCase: ApprovePreInvoiceUseCase,
        private zarinpalService: ZarinpalService | null,
        private preInvoiceRepository: IPreInvoiceRepository,
        private shopRepository: IShopRepository
    ) { }

    create = async (req: Request, res: Response) => {
        try {
            const invoice = await this.createPreInvoiceUseCase.execute(req.body);
            res.status(201).json({ success: true, data: invoice });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getAll = async (_req: Request, res: Response) => {
        try {
            const invoices = await this.getPreInvoicesUseCase.getAll();
            res.status(200).json({ success: true, data: invoices });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getByShopId = async (req: Request, res: Response) => {
        try {
            const invoices = await this.getPreInvoicesUseCase.getByShopId(req.params.shopId);
            res.status(200).json({ success: true, data: invoices });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    uploadReceipt = async (req: Request, res: Response) => {
        try {
            const invoiceId = req.params.invoiceId;
            if (!req.file) {
                res.status(400).json({ success: false, error: 'No receipt image uploaded' });
                return;
            }
            const receiptImageUrl = `/uploads/${req.file.filename}`;
            const updated = await this.uploadReceiptUseCase.execute(invoiceId, receiptImageUrl);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    approve = async (req: Request, res: Response) => {
        try {
            const updated = await this.approvePreInvoiceUseCase.execute(req.params.invoiceId);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    /**
     * Initiate Zarinpal payment for a pre-invoice
     */
    payWithZarinpal = async (req: Request, res: Response) => {
        try {
            if (!this.zarinpalService) {
                res.status(500).json({ success: false, error: 'Payment gateway not configured' });
                return;
            }

            const invoice = await this.preInvoiceRepository.findById(req.params.invoiceId);
            if (!invoice) {
                res.status(404).json({ success: false, error: 'Invoice not found' });
                return;
            }
            if (invoice.status === PreInvoiceStatus.APPROVED) {
                res.status(400).json({ success: false, error: 'Invoice is already approved' });
                return;
            }

            const amountRials = invoice.finalPrice * 10;
            const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
            const callbackUrl = `${apiBaseUrl}/api/v1/pre-invoices/zarinpal/verify`;

            const shop = await this.shopRepository.findById(invoice.shopId);
            const description = `فعال‌سازی پلتفرم ژست — ${shop?.name || 'فروشگاه'}`;

            const result = await this.zarinpalService.requestPayment({
                amount: amountRials,
                description,
                callbackUrl,
            });

            if (result.data.code === 100) {
                await this.preInvoiceRepository.update(invoice.id, {
                    zarinpalAuthority: result.data.authority,
                });

                const paymentUrl = this.zarinpalService.getPaymentUrl(result.data.authority);
                res.status(200).json({
                    success: true,
                    data: { paymentUrl, authority: result.data.authority },
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: this.zarinpalService.getErrorDescription(result.data.code),
                });
            }
        } catch (error: any) {
            console.error('Zarinpal pay error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    /**
     * Zarinpal callback verification
     */
    verifyZarinpalPayment = async (req: Request, res: Response) => {
        const authority = req.query.Authority as string;
        const status = req.query.Status as string;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        try {
            if (!this.zarinpalService || !authority) {
                res.redirect(`${frontendUrl}/app?payment=error`);
                return;
            }

            const invoice = await this.preInvoiceRepository.findByAuthority(authority);
            if (!invoice) {
                res.redirect(`${frontendUrl}/app?payment=error&msg=invoice_not_found`);
                return;
            }

            if (status !== 'OK') {
                res.redirect(`${frontendUrl}/app?payment=cancelled`);
                return;
            }

            const amountRials = invoice.finalPrice * 10;
            const verifyResult = await this.zarinpalService.verifyPayment(authority, amountRials);

            if (this.zarinpalService.isSuccessCode(verifyResult.data.code)) {
                await this.preInvoiceRepository.update(invoice.id, {
                    status: PreInvoiceStatus.APPROVED,
                    zarinpalRefId: verifyResult.data.ref_id,
                });

                await this.shopRepository.update(invoice.shopId, {
                    isActivated: true,
                    credit: invoice.creditCount,
                    licenseDurationMonths: invoice.durationMonths,
                });

                res.redirect(`${frontendUrl}/app?payment=success&refId=${verifyResult.data.ref_id}`);
            } else {
                res.redirect(`${frontendUrl}/app?payment=failed`);
            }
        } catch (error: any) {
            console.error('Zarinpal verify error:', error);
            res.redirect(`${frontendUrl}/app?payment=error`);
        }
    };
}
