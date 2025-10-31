import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CreateCharacterUseCase } from '@application/usecases/character/CreateCharacterUseCase';
import { UpdateCharacterUseCase } from '@application/usecases/character/UpdateCharacterUseCase';
import { GetUserCharactersUseCase } from '@application/usecases/character/GetUserCharactersUseCase';
import { DeleteCharacterUseCase } from '@application/usecases/character/DeleteCharacterUseCase';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class CharacterController {
  constructor(
    private createCharacterUseCase: CreateCharacterUseCase,
    private getUserCharactersUseCase: GetUserCharactersUseCase,
    private deleteCharacterUseCase: DeleteCharacterUseCase,
    private updateCharacterUseCase: UpdateCharacterUseCase
  ) {}

  createCharacter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const userId = req.user!.userId;
    const images = req.files as Express.Multer.File[];

    if (!images || images.length === 0) {
      throw new AppError(400, 'At least 3 images are required');
    }

    if (images.length < 3 || images.length > 5) {
      throw new AppError(400, 'Character must have between 3 and 5 images');
    }

    const character = await this.createCharacterUseCase.execute({
      userId,
      name,
      images
    });

    res.status(201).json({
      status: 'success',
      data: { character }
    });
  });

  getUserCharacters = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const characters = await this.getUserCharactersUseCase.execute(userId);

    res.status(200).json({
      status: 'success',
      data: { characters }
    });
  });

  deleteCharacter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    await this.deleteCharacterUseCase.execute(id, userId);

    res.status(200).json({
      status: 'success',
      message: 'Character deleted successfully'
    });
  });

  updateCharacter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, existingImages } = req.body as { name?: string; existingImages?: string };
    const userId = req.user!.userId;
    const newImages = (req.files as Express.Multer.File[]) || [];

    let parsedExisting: any[] | undefined = undefined;
    if (existingImages) {
      try {
        parsedExisting = JSON.parse(existingImages);
      } catch {
        parsedExisting = undefined;
      }
    }

    const character = await this.updateCharacterUseCase.execute({
      id,
      userId,
      name,
      existingImages: parsedExisting,
      newImages
    });

    res.status(200).json({
      status: 'success',
      data: { character }
    });
  });
}
