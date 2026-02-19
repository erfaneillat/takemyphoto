import { ShopType } from './Shop';

export interface SampleImage {
    url: string;
    publicId: string;
}

export interface ShopCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    types: ShopType[];
    sampleImages: SampleImage[];
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateShopCategoryDTO {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    types: ShopType[];
    order?: number;
}

export interface UpdateShopCategoryDTO {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    types?: ShopType[];
    order?: number;
    isActive?: boolean;
}
