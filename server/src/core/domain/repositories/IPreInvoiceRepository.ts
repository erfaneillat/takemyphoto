import { PreInvoice, CreatePreInvoiceDTO, UpdatePreInvoiceDTO } from '../entities/PreInvoice';

export interface IPreInvoiceRepository {
    create(data: CreatePreInvoiceDTO): Promise<PreInvoice>;
    findById(id: string): Promise<PreInvoice | null>;
    findByShopId(shopId: string): Promise<PreInvoice[]>;
    findAll(): Promise<PreInvoice[]>;
    findByAuthority(authority: string): Promise<PreInvoice | null>;
    update(id: string, data: UpdatePreInvoiceDTO): Promise<PreInvoice | null>;
    delete(id: string): Promise<boolean>;
}
