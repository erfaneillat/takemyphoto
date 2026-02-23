import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import crypto from 'crypto';

export class RegenerateShopLicenseUseCase {
    constructor(private shopRepository: IShopRepository) { }

    private generateLicenseKey(): string {
        // Generate 8-character uppercase alphanumeric key
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: 0/O, 1/I
        let key = '';
        const bytes = crypto.randomBytes(8);
        for (let i = 0; i < 8; i++) {
            key += chars[bytes[i] % chars.length];
        }
        return key;
    }

    async execute(shopId: string) {
        const shop = await this.shopRepository.findById(shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        const newLicenseKey = this.generateLicenseKey();

        return await this.shopRepository.update(shopId, {
            licenseKey: newLicenseKey,
            isActivated: false,
            activatedAt: null as any,
            deviceFingerprint: null as any,
            licenseExpiresAt: null as any,
        });
    }
}
