import { Router } from 'express';
import { AdminTemplateController } from '../controllers/AdminTemplateController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

export const createAdminTemplateRoutes = (adminTemplateController: AdminTemplateController): Router => {
  const router = Router();

  // All routes are protected (you may want to add admin middleware)
  router.get('/', authMiddleware, adminTemplateController.getTemplates);
  router.post('/', authMiddleware, upload.single('image'), adminTemplateController.createTemplate);
  router.post('/import', authMiddleware, adminTemplateController.importTemplates);
  router.post('/sync-stats', authMiddleware, adminTemplateController.syncTemplateStats);
  router.put('/:id', authMiddleware, adminTemplateController.updateTemplate);
  router.delete('/:id', authMiddleware, adminTemplateController.deleteTemplate);

  return router;
};
