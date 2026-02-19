import { ShopStyle, CreateShopStyleDTO, UpdateShopStyleDTO } from '../entities/ShopStyle';

export interface IShopStyleRepository {
    create(data: CreateShopStyleDTO): Promise<ShopStyle>;
    findById(id: string): Promise<ShopStyle | null>;
    findBySlug(slug: string): Promise<ShopStyle | null>;
    findAll(filters?: { isActive?: boolean; types?: string[] }): Promise<ShopStyle[]>;
    update(id: string, data: UpdateShopStyleDTO): Promise<ShopStyle | null>;
    delete(id: string): Promise<boolean>;
    exists(slug: string, excludeId?: string): Promise<boolean>;
}
