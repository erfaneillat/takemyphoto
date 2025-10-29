import { Router } from 'express';
import { ImageGenerationController } from '../controllers/NanoBananaController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  }
});

export const createImageGenerationRoutes = (controller: ImageGenerationController) => {
  const router = Router();

  // Generate image (text-to-image)
  router.post(
    '/generate',
    authMiddleware,
    upload.array('images', 5),
    controller.generateImage
  );

  // Edit image (image-to-image)
  router.post(
    '/edit',
    authMiddleware,
    upload.array('images', 5),
    controller.editImage
  );

  // Get user's generated images (history)
  router.get(
    '/images',
    authMiddleware,
    controller.getUserGeneratedImages
  );

  return router;
};
