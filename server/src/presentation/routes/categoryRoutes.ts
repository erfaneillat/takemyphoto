import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createCategoryRoutes = (categoryController: CategoryController): Router => {
  const router = Router();

  // Public route
  router.get('/', categoryController.getCategories);

  // Protected admin routes (you may want to add admin middleware)
  router.post('/', authMiddleware, categoryController.createCategory);
  router.put('/:id', authMiddleware, categoryController.updateCategory);
  router.delete('/:id', authMiddleware, categoryController.deleteCategory);

  return router;
};
