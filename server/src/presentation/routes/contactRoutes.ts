import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createContactRoutes = (contactController: ContactController): Router => {
  const router = Router();

  // Public route - submit contact form
  router.post('/', contactController.submitContactForm);

  // Admin routes - require authentication
  router.get('/admin', authMiddleware, contactController.getContactMessages);
  router.patch('/admin/:id/status', authMiddleware, contactController.updateContactStatus);
  router.delete('/admin/:id', authMiddleware, contactController.deleteContactMessage);

  return router;
};
