import { Router } from 'express';
import { ThumbnailController } from '../controllers/ThumbnailController';
import { upload } from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

export const createThumbnailRoutes = (thumbnailController: ThumbnailController): Router => {
    const router = Router();

    router.post(
        '/generate',
        authMiddleware,
        upload.array('images', 6),
        thumbnailController.generate
    );

    return router;
};

