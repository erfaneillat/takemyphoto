import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

export const createTemplateRoutes = (templateController: TemplateController): Router => {
  const router = Router();

  // Public route with optional auth (to include isFavorite field if user is logged in)
  router.get('/', optionalAuthMiddleware, templateController.getTemplates);

  // Protected routes
  router.get('/favorites', authMiddleware, templateController.getUserFavorites);
  router.post('/:templateId/favorite', authMiddleware, templateController.toggleFavorite);

  return router;
};
