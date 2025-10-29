import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate, userSchemas } from '../middleware/validationMiddleware';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  router.get('/me', userController.getMe);
  router.get('/profile', userController.getProfile);
  router.patch('/profile', validate(userSchemas.updateProfile), userController.updateProfile);

  return router;
};
