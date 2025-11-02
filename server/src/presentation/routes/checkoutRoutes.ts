import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createCheckoutRoutes = (checkoutController: CheckoutController): Router => {
  const router = Router();

  // Public route - Submit checkout form
  router.post('/', checkoutController.submitCheckoutForm);

  // Admin routes - Protected
  router.get('/admin', authMiddleware, checkoutController.getCheckoutOrders);
  router.patch('/admin/:id/status', authMiddleware, checkoutController.updateCheckoutStatus);
  router.delete('/admin/:id', authMiddleware, checkoutController.deleteCheckoutOrder);

  return router;
};
