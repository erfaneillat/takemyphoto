import { Router } from 'express';
import { ShopController } from '../controllers/ShopController';
import { upload } from '../middleware/uploadMiddleware';

export const createShopRoutes = (shopController: ShopController): Router => {
    const router = Router();

    // Admin routes
    router.post('/', shopController.createShop);
    router.get('/', shopController.getShops);
    router.put('/:id', shopController.updateShop);
    router.delete('/:id', shopController.deleteShop);
    router.post('/:id/regenerate-license', shopController.regenerateLicense);
    router.post(
        '/:id/logos',
        upload.fields([
            { name: 'logoWithBg', maxCount: 1 },
            { name: 'logoWithoutBg', maxCount: 1 }
        ]),
        shopController.uploadLogos
    );

    // Public routes (used by Zhest app)
    router.get('/manifest/:licenseKey', shopController.getManifest);
    router.post('/activate', shopController.activateLicense);
    router.post('/validate', shopController.validateLicense);
    router.get('/info', shopController.getShopInfo);

    return router;
};
