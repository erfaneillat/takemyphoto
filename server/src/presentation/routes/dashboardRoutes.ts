import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createDashboardRoutes = (dashboardController: DashboardController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  router.get('/stats', dashboardController.getStats);
  router.get('/generated-images', dashboardController.getGeneratedImages);

  return router;
};
