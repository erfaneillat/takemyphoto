import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createCheckoutRoutes = (checkoutController: CheckoutController): Router => {
  const router = Router();

  // Public route - Submit checkout form (initiates payment)
  router.post('/', checkoutController.submitCheckoutForm);

  // Public route - Verify payment callback
  router.get('/verify', checkoutController.verifyPayment);
  router.post('/verify', checkoutController.verifyPayment);

  // Admin routes - Protected
  router.get('/admin', authMiddleware, checkoutController.getCheckoutOrders);
  router.patch('/admin/:id/status', authMiddleware, checkoutController.updateCheckoutStatus);
  router.delete('/admin/:id', authMiddleware, checkoutController.deleteCheckoutOrder);

  return router;
};
