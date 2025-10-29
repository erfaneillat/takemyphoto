import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, authSchemas } from '../middleware/validationMiddleware';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post(
    '/send-code',
    validate(authSchemas.sendCode),
    authController.sendVerificationCode
  );

  router.post(
    '/verify-code',
    validate(authSchemas.verifyCode),
    authController.verifyCode
  );

  router.post(
    '/google',
    authController.googleAuth
  );

  router.post(
    '/admin/login',
    authController.adminLogin
  );

  return router;
};
