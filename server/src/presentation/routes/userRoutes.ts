import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate, userSchemas } from '../middleware/validationMiddleware';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // User routes
  router.get('/me', userController.getMe);
  router.get('/profile', userController.getProfile);
  router.patch('/profile', validate(userSchemas.updateProfile), userController.updateProfile);

  // Admin routes
  router.get('/admin', userController.getUsers);
  router.get('/admin/stats', userController.getUserStats);
  router.patch('/admin/:id', userController.updateUser);
  router.delete('/admin/:id', userController.deleteUser);

  return router;
};
