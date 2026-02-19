import { ShopCategory, CreateShopCategoryDTO, UpdateShopCategoryDTO } from '../entities/ShopCategory';

export interface IShopCategoryRepository {
    create(data: CreateShopCategoryDTO): Promise<ShopCategory>;
    findById(id: string): Promise<ShopCategory | null>;
    findBySlug(slug: string): Promise<ShopCategory | null>;
    findAll(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopCategory[]>;
    update(id: string, data: UpdateShopCategoryDTO): Promise<ShopCategory | null>;
    delete(id: string): Promise<boolean>;
    exists(slug: string, excludeId?: string): Promise<boolean>;
}
