import { Router } from 'express';
import { ZarinpalController } from '../controllers/ZarinpalController';

export const createZarinpalRoutes = (zarinpalController: ZarinpalController): Router => {
    const router = Router();

    // Public route - Submit checkout form (initiates Zarinpal payment)
    router.post('/checkout', zarinpalController.submitCheckoutForm);

    // Public route - Verify payment callback from Zarinpal
    router.get('/verify', zarinpalController.verifyPayment);

    return router;
};
