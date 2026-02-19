import { ShopType } from './Shop';

export interface ShopStyle {
    id: string;
    name: string;
    slug: string;
    description?: string;
    prompt: string;
    thumbnailUrl?: string;
    types: ShopType[];
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateShopStyleDTO {
    name: string;
    slug: string;
    description?: string;
    prompt: string;
    types: ShopType[];
    order?: number;
}

export interface UpdateShopStyleDTO {
    name?: string;
    slug?: string;
    description?: string;
    prompt?: string;
    thumbnailUrl?: string;
    types?: ShopType[];
    order?: number;
    isActive?: boolean;
}
