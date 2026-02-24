import { IPreInvoiceRepository } from '../../../core/domain/repositories/IPreInvoiceRepository';
import { PreInvoice, CreatePreInvoiceDTO, UpdatePreInvoiceDTO, PreInvoiceStatus } from '../../../core/domain/entities/PreInvoice';
import { PreInvoiceModel } from '../models/PreInvoiceModel';

export class PreInvoiceRepository implements IPreInvoiceRepository {
    private mapToEntity(doc: any): PreInvoice {
        return {
            id: doc._id.toString(),
            shopId: doc.shopId.toString(),
            basePrice: doc.basePrice,
            discountPercentage: doc.discountPercentage,
            finalPrice: doc.finalPrice,
            creditCount: doc.creditCount,
            durationMonths: doc.durationMonths,
            status: doc.status as PreInvoiceStatus,
            receiptImageUrl: doc.receiptImageUrl,
            accountDetails: doc.accountDetails,
            zarinpalAuthority: doc.zarinpalAuthority,
            zarinpalRefId: doc.zarinpalRefId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async create(data: CreatePreInvoiceDTO): Promise<PreInvoice> {
        const doc = await PreInvoiceModel.create(data);
        return this.mapToEntity(doc);
    }

    async findById(id: string): Promise<PreInvoice | null> {
        const doc = await PreInvoiceModel.findById(id);
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByShopId(shopId: string): Promise<PreInvoice[]> {
        const docs = await PreInvoiceModel.find({ shopId }).sort({ createdAt: -1 });
        return docs.map(this.mapToEntity);
    }

    async findAll(): Promise<PreInvoice[]> {
        const docs = await PreInvoiceModel.find().sort({ createdAt: -1 }).populate('shopId', 'name');
        // populate shopname into any? It's fine for simple access from admin routes
        return docs.map(doc => {
            const entity = this.mapToEntity(doc);
            if (doc.shopId && typeof (doc.shopId as any).name === 'string') {
                (entity as any).shopName = (doc.shopId as any).name;
            }
            return entity;
        });
    }

    async findByAuthority(authority: string): Promise<PreInvoice | null> {
        const doc = await PreInvoiceModel.findOne({ zarinpalAuthority: authority });
        return doc ? this.mapToEntity(doc) : null;
    }

    async update(id: string, data: UpdatePreInvoiceDTO): Promise<PreInvoice | null> {
        const doc = await PreInvoiceModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );
        return doc ? this.mapToEntity(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PreInvoiceModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }
}
