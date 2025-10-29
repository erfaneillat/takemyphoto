import { Router } from 'express';
import { CharacterController } from '../controllers/CharacterController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate, characterSchemas } from '../middleware/validationMiddleware';

export const createCharacterRoutes = (characterController: CharacterController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  router.post(
    '/',
    upload.array('images', 5),
    validate(characterSchemas.create),
    characterController.createCharacter
  );

  router.get('/', characterController.getUserCharacters);

  router.delete('/:id', characterController.deleteCharacter);

  return router;
};
