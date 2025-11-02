import { Router } from 'express';
import { ErrorLogController } from '../controllers/ErrorLogController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createErrorLogRoutes = (errorLogController: ErrorLogController): Router => {
  const router = Router();

  // All routes require admin authentication
  router.get('/', authMiddleware, errorLogController.getErrorLogs);
  router.get('/stats', authMiddleware, errorLogController.getErrorLogStats);
  router.patch('/:id', authMiddleware, errorLogController.updateErrorLog);
  router.delete('/:id', authMiddleware, errorLogController.deleteErrorLog);
  router.post('/delete-many', authMiddleware, errorLogController.deleteManyErrorLogs);

  return router;
};
