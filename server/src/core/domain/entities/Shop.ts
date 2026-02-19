export enum ShopType {
    GOLD = 'gold',
    CLOTHES = 'clothes',
    WATCH = 'watch'
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
