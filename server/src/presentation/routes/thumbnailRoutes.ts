import { Router } from 'express';
import { ThumbnailController } from '../controllers/ThumbnailController';
import { upload } from '../middleware/uploadMiddleware';

export const createThumbnailRoutes = (thumbnailController: ThumbnailController): Router => {
    const router = Router();

    router.post(
        '/generate',
        upload.array('images', 6),
        thumbnailController.generate
    );

    return router;
};

