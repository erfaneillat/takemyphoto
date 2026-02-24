import mongoose, { Schema, Document } from 'mongoose';
import { PreInvoiceStatus } from '../../../core/domain/entities/PreInvoice';

export interface IPreInvoiceDocument extends Document {
    shopId: mongoose.Types.ObjectId;
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

const PreInvoiceSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        basePrice: { type: Number, required: true },
        discountPercentage: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        creditCount: { type: Number, required: true },
        durationMonths: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(PreInvoiceStatus),
            default: PreInvoiceStatus.PENDING,
            required: true,
        },
        receiptImageUrl: { type: String, required: false },
        accountDetails: { type: String, required: false },
        zarinpalAuthority: { type: String, required: false },
        zarinpalRefId: { type: Number, required: false },
    },
    {
        timestamps: true,
    }
);

// Indexes
PreInvoiceSchema.index({ shopId: 1 });
PreInvoiceSchema.index({ status: 1 });
PreInvoiceSchema.index({ createdAt: -1 });

export const PreInvoiceModel = mongoose.model<IPreInvoiceDocument>('PreInvoice', PreInvoiceSchema);
