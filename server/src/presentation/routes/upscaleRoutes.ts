import { Router } from 'express';
import { UpscaleController, upscaleUpload } from '../controllers/UpscaleController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createUpscaleRoutes(upscaleController: UpscaleController): Router {
    const router = Router();

    // POST /api/v1/upscale - Upscale image
    router.post('/',
        authMiddleware,
        upscaleUpload.single('image'),
        async (req, res) => {
            await upscaleController.upscaleImage(req, res);
        }
    );

    return router;
}
