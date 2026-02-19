import { Request, Response, NextFunction } from 'express';
import { Shop } from '@core/domain/entities/Shop';
import { IShopRepository } from '@core/domain/repositories/IShopRepository';

export interface LicenseAuthRequest extends Request {
    shop?: Shop;
}

/**
 * Creates a license-based auth middleware for shop requests.
 * Validates the license key sent via x-license-key header.
 * Fingerprint is only checked during activation (to bind to one device),
 * not on every API request — browser fingerprints are not stable across sessions.
 */
export const createLicenseAuthMiddleware = (shopRepository: IShopRepository) => {
    return async (req: LicenseAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const licenseKey = req.headers['x-license-key'] as string | undefined;

            if (!licenseKey) {
                console.warn('[licenseAuthMiddleware] Missing license key header', {
                    path: req.path,
                    method: req.method,
                });
                res.status(401).json({ error: 'License key is required' });
                return;
            }

            const shop = await shopRepository.findByLicenseKey(licenseKey.toUpperCase());

            if (!shop) {
                res.status(401).json({ error: 'Invalid license key' });
                return;
            }

            if (!shop.isActive) {
                res.status(403).json({ error: 'This license has been deactivated' });
                return;
            }

            if (!shop.isActivated) {
                res.status(403).json({ error: 'This license has not been activated' });
                return;
            }

            if (shop.licenseExpiresAt && new Date() > new Date(shop.licenseExpiresAt)) {
                res.status(403).json({ error: 'مدت اعتبار لایسنس شما به پایان رسیده است' });
                return;
            }

            console.info('[licenseAuthMiddleware] License validated', {
                shopId: shop.id,
                shopName: shop.name,
                path: req.path,
                method: req.method,
            });

            req.shop = shop;
            next();
        } catch (error) {
            console.error('[licenseAuthMiddleware] Validation error', {
                path: req.path,
                method: req.method,
                error: (error as Error)?.message,
            });
            res.status(500).json({ error: 'License validation failed' });
        }
    };
};
