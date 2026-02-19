import { Router } from 'express';
import { ShopProductImageController } from '../controllers/ShopProductImageController';
import { upload } from '../middleware/uploadMiddleware';
import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { createLicenseAuthMiddleware } from '../middleware/licenseAuthMiddleware';

export const createShopProductImageRoutes = (
    shopProductImageController: ShopProductImageController,
    shopRepository: IShopRepository
): Router => {
    const router = Router();
    const licenseAuth = createLicenseAuthMiddleware(shopRepository);

    // List generated images for shop
    // GET /api/v1/shops/product-image/images
    // Headers: x-license-key
    router.get('/images', licenseAuth, shopProductImageController.listImages);

    // Generate product image for shop (license-based auth)
    // POST /api/v1/shops/product-image/generate
    // Headers: x-license-key
    // Body: productName, productDescription (optional), style, aspectRatio (optional)
    // Files: productImages[] (up to 5), referenceImage (optional, 1 only)
    router.post(
        '/generate',
        licenseAuth,
        upload.fields([
            { name: 'productImages', maxCount: 5 },
            { name: 'referenceImage', maxCount: 1 }
        ]),
        shopProductImageController.generate
    );

    return router;
};
