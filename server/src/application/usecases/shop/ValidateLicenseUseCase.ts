import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { Shop } from '@core/domain/entities/Shop';

export class ValidateLicenseUseCase {
    constructor(private shopRepository: IShopRepository) { }

    async execute(licenseKey: string, deviceFingerprint: string): Promise<Shop> {
        const shop = await this.shopRepository.findByLicenseKey(licenseKey);

        if (!shop) {
            throw new Error('Invalid license key');
        }

        if (!shop.isActive) {
            throw new Error('This license has been deactivated');
        }

        if (!shop.isActivated) {
            throw new Error('This license has not been activated');
        }

        if (shop.deviceFingerprint && shop.deviceFingerprint !== deviceFingerprint) {
            throw new Error('This license is bound to a different device');
        }

        // Check if license has expired
        if (shop.licenseExpiresAt && new Date() > new Date(shop.licenseExpiresAt)) {
            throw new Error('مدت اعتبار لایسنس شما به پایان رسیده است');
        }

        return shop;
    }
}
