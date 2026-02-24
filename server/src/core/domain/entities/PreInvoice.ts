export enum PreInvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid', // not strictly needed if jumping from pending to approved, but good to have
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface PreInvoice {
    id: string;
    shopId: string;
    basePrice: number;
    discountPercentage: number;
    finalPrice: number;
    creditCount: number;
    durationMonths: number;
    status: PreInvoiceStatus;
    receiptImageUrl?: string;
    accountDetails?: string;
    zarinpalAuthority?: string;
    zarinpalRefId?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePreInvoiceDTO {
    shopId: string;
    basePrice: number;
    discountPercentage: number;
    finalPrice: number;
    creditCount: number;
    durationMonths: number;
    accountDetails?: string;
}

export interface UpdatePreInvoiceDTO {
    status?: PreInvoiceStatus;
    receiptImageUrl?: string;
    zarinpalAuthority?: string;
    zarinpalRefId?: number;
}
