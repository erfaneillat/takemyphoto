import { Router } from 'express';
import { EnhanceController } from '../controllers/EnhanceController';
import { upload } from '../middleware/uploadMiddleware';

export const createEnhanceRoutes = (enhanceController: EnhanceController): Router => {
  const router = Router();

  // Public routes (no authentication required for now)

  // Upscale image
  router.post(
    '/upscale',
    upload.single('image'),
    enhanceController.upscaleImage
  );

  // Image to prompt (using OpenAI Vision)
  router.post(
    '/image-to-prompt',
    upload.single('image'),
    enhanceController.imageToPrompt
  );

  return router;
};
