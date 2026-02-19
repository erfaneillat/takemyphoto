export enum ShopType {
    GOLD = 'gold',
    CLOTHES = 'clothes',
    WATCH = 'watch',
    SHOES = 'shoes',
    BAGS = 'bags',
    COSMETICS = 'cosmetics',
    FOOD = 'food',
    ELECTRONICS = 'electronics',
    FURNITURE = 'furniture',
    ACCESSORIES = 'accessories',
    PERFUME = 'perfume',
    OTHER = 'other'
}

export interface Shop {
    id: string;
    name: string;
    description?: string;
    types: ShopType[];
    licenseKey: string;
    licenseDurationMonths: number;
    licenseExpiresAt?: Date;
    isActivated: boolean;
    activatedAt?: Date;
    deviceFingerprint?: string;
    generationCount: number;
    credit: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateShopDTO {
    name: string;
    description?: string;
    types: ShopType[];
    licenseDurationMonths: number;
    credit?: number;
}

export interface ActivateLicenseDTO {
    licenseKey: string;
    deviceFingerprint: string;
}
