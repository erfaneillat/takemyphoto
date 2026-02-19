import { Router } from 'express';
import { ShopStyleController } from '../controllers/ShopStyleController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

export const createShopStyleRoutes = (shopStyleController: ShopStyleController): Router => {
    const router = Router();

    // Public route (used by Zhest app)
    router.get('/', shopStyleController.getShopStyles);

    // Protected admin routes
    router.post('/seed', authMiddleware, shopStyleController.seedDefaults);
    router.post('/', authMiddleware, shopStyleController.createShopStyle);
    router.put('/:id', authMiddleware, shopStyleController.updateShopStyle);
    router.delete('/:id', authMiddleware, shopStyleController.deleteShopStyle);

    // Thumbnail management
    router.post('/:id/thumbnail', authMiddleware, upload.single('thumbnail'), shopStyleController.uploadThumbnail);
    router.delete('/:id/thumbnail', authMiddleware, shopStyleController.deleteThumbnail);

    return router;
};
