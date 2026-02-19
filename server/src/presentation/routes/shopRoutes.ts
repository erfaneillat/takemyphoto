import { Router } from 'express';
import { ShopController } from '../controllers/ShopController';

export const createShopRoutes = (shopController: ShopController): Router => {
    const router = Router();

    // Admin routes
    router.post('/', shopController.createShop);
    router.get('/', shopController.getShops);
    router.put('/:id', shopController.updateShop);
    router.delete('/:id', shopController.deleteShop);

    // Public routes (used by Zhest app)
    router.post('/activate', shopController.activateLicense);
    router.post('/validate', shopController.validateLicense);
    router.get('/info', shopController.getShopInfo);

    return router;
};
