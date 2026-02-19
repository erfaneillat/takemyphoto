import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { ActivateLicenseDTO, Shop } from '@core/domain/entities/Shop';

export class ActivateLicenseUseCase {
    constructor(private shopRepository: IShopRepository) { }

    async execute(data: ActivateLicenseDTO): Promise<Shop> {
        const shop = await this.shopRepository.findByLicenseKey(data.licenseKey);

        if (!shop) {
            throw new Error('کلید لایسنس نامعتبر است');
        }

        if (!shop.isActive) {
            throw new Error('این لایسنس غیرفعال شده است');
        }

        // If already activated on a DIFFERENT device, reject
        if (shop.isActivated && shop.deviceFingerprint && shop.deviceFingerprint !== data.deviceFingerprint) {
            throw new Error('این لایسنس قبلاً روی دستگاه دیگری فعال شده است');
        }

        // Check if license has expired (for re-activation on same device)
        if (shop.licenseExpiresAt && new Date() > new Date(shop.licenseExpiresAt)) {
            throw new Error('مدت اعتبار لایسنس شما به پایان رسیده است');
        }

        // Same device re-activation (cache-clear scenario) or first activation
        const isFirstActivation = !shop.isActivated;
        const activatedAt = isFirstActivation ? new Date() : shop.activatedAt!;

        // Compute expiry date on first activation
        let licenseExpiresAt = shop.licenseExpiresAt;
        if (isFirstActivation) {
            const expiry = new Date(activatedAt);
            expiry.setMonth(expiry.getMonth() + shop.licenseDurationMonths);
            licenseExpiresAt = expiry;
        }

        const updated = await this.shopRepository.update(shop.id, {
            isActivated: true,
            activatedAt,
            deviceFingerprint: data.deviceFingerprint,
            licenseExpiresAt
        });

        if (!updated) {
            throw new Error('فعال‌سازی لایسنس با خطا مواجه شد');
        }

        return updated;
    }
}
