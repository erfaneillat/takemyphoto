import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { ShopStyle, CreateShopStyleDTO, UpdateShopStyleDTO } from '@core/domain/entities/ShopStyle';
import { ShopStyleModel } from '../models/ShopStyleModel';

export class ShopStyleRepository implements IShopStyleRepository {
    async create(data: CreateShopStyleDTO): Promise<ShopStyle> {
        const style = await ShopStyleModel.create(data);
        return style.toJSON() as ShopStyle;
    }

    async findById(id: string): Promise<ShopStyle | null> {
        const style = await ShopStyleModel.findById(id);
        return style ? (style.toJSON() as ShopStyle) : null;
    }

    async findBySlug(slug: string): Promise<ShopStyle | null> {
        const style = await ShopStyleModel.findOne({ slug });
        return style ? (style.toJSON() as ShopStyle) : null;
    }

    async findAll(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopStyle[]> {
        const query: any = {};
        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        if (filters?.types && filters.types.length > 0) {
            query.types = { $in: filters.types };
        }
        const styles = await ShopStyleModel.find(query).sort({ order: 1, name: 1 });
        return styles.map(s => s.toJSON() as ShopStyle);
    }

    async update(id: string, data: UpdateShopStyleDTO): Promise<ShopStyle | null> {
        const style = await ShopStyleModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        return style ? (style.toJSON() as ShopStyle) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ShopStyleModel.findByIdAndDelete(id);
        return !!result;
    }

    async exists(slug: string, excludeId?: string): Promise<boolean> {
        const query: any = { slug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ShopStyleModel.countDocuments(query);
        return count > 0;
    }
}
