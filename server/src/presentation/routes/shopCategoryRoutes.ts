import { Router } from 'express';
import { ShopCategoryController } from '../controllers/ShopCategoryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

export const createShopCategoryRoutes = (shopCategoryController: ShopCategoryController): Router => {
    const router = Router();

    // Public route (used by Zhest app)
    router.get('/', shopCategoryController.getShopCategories);

    // Protected admin routes
    router.post('/', authMiddleware, shopCategoryController.createShopCategory);
    router.put('/:id', authMiddleware, shopCategoryController.updateShopCategory);
    router.delete('/:id', authMiddleware, shopCategoryController.deleteShopCategory);

    // Sample image management
    router.post('/:id/images', authMiddleware, upload.array('images', 40), shopCategoryController.uploadSampleImages);
    router.delete('/:id/images/:publicId', authMiddleware, shopCategoryController.deleteSampleImage);

    return router;
};
