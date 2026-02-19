import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';
import { ShopCategory, CreateShopCategoryDTO, UpdateShopCategoryDTO } from '@core/domain/entities/ShopCategory';
import { ShopCategoryModel } from '../models/ShopCategoryModel';

export class ShopCategoryRepository implements IShopCategoryRepository {
    async create(data: CreateShopCategoryDTO): Promise<ShopCategory> {
        const category = await ShopCategoryModel.create(data);
        return category.toJSON() as ShopCategory;
    }

    async findById(id: string): Promise<ShopCategory | null> {
        const category = await ShopCategoryModel.findById(id);
        return category ? (category.toJSON() as ShopCategory) : null;
    }

    async findBySlug(slug: string): Promise<ShopCategory | null> {
        const category = await ShopCategoryModel.findOne({ slug });
        return category ? (category.toJSON() as ShopCategory) : null;
    }

    async findAll(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopCategory[]> {
        const query: any = {};
        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        if (filters?.types && filters.types.length > 0) {
            query.types = { $in: filters.types };
        }
        const categories = await ShopCategoryModel.find(query).sort({ order: 1, name: 1 });
        return categories.map(cat => cat.toJSON() as ShopCategory);
    }

    async update(id: string, data: UpdateShopCategoryDTO): Promise<ShopCategory | null> {
        const category = await ShopCategoryModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        return category ? (category.toJSON() as ShopCategory) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ShopCategoryModel.findByIdAndDelete(id);
        return !!result;
    }

    async exists(slug: string, excludeId?: string): Promise<boolean> {
        const query: any = { slug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ShopCategoryModel.countDocuments(query);
        return count > 0;
    }
}
