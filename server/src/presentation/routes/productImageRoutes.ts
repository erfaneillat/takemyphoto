import { Router } from 'express';
import { ProductImageController } from '../controllers/ProductImageController';
import { upload } from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

export const createProductImageRoutes = (productImageController: ProductImageController): Router => {
    const router = Router();

    // Generate product image
    // POST /api/v1/tools/product-image/generate
    // Body: productName, productDescription (optional), style, aspectRatio (optional), resolution (optional)
    // Files: productImages[] (up to 5), referenceImage (optional, 1 only)
    router.post(
        '/generate',
        authMiddleware,
        upload.fields([
            { name: 'productImages', maxCount: 5 },
            { name: 'referenceImage', maxCount: 1 }
        ]),
        productImageController.generate
    );

    return router;
};
