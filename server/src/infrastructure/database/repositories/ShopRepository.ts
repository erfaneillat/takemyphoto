import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { Shop, CreateShopDTO } from '@core/domain/entities/Shop';
import { ShopModel } from '../models/ShopModel';

export class ShopRepository implements IShopRepository {
    async create(data: CreateShopDTO & { licenseKey: string }): Promise<Shop> {
        const shop = await ShopModel.create(data);
        return shop.toJSON() as Shop;
    }

    async findAll(): Promise<Shop[]> {
        const shops = await ShopModel.find().sort({ createdAt: -1 }).lean();
        return shops.map(shop => {
            const s = shop as any;
            s.id = s._id.toString();
            delete s._id;
            delete s.__v;
            return s as Shop;
        });
    }

    async findById(id: string): Promise<Shop | null> {
        const shop = await ShopModel.findById(id);
        return shop ? (shop.toJSON() as Shop) : null;
    }

    async findByLicenseKey(licenseKey: string): Promise<Shop | null> {
        const shop = await ShopModel.findOne({ licenseKey: licenseKey.toUpperCase() });
        return shop ? (shop.toJSON() as Shop) : null;
    }

    async update(id: string, data: Partial<Shop>): Promise<Shop | null> {
        const shop = await ShopModel.findByIdAndUpdate(id, data, { new: true });
        return shop ? (shop.toJSON() as Shop) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ShopModel.findByIdAndDelete(id);
        return !!result;
    }

    async incrementGenerationCount(id: string): Promise<void> {
        await ShopModel.findByIdAndUpdate(id, { $inc: { generationCount: 1 } });
    }

    async decrementCredit(id: string, amount: number = 1): Promise<void> {
        await ShopModel.findByIdAndUpdate(id, { $inc: { credit: -amount } });
    }
}
