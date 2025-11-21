import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GenerateImageUseCase } from '@application/usecases/nanobanana/GenerateImageUseCase';
import { EditImageUseCase } from '@application/usecases/nanobanana/EditImageUseCase';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class ImageGenerationController {
  constructor(
    private generateImageUseCase: GenerateImageUseCase,
    private editImageUseCase: EditImageUseCase,
    private generatedImageRepository: IGeneratedImageEntityRepository
  ) { }

  generateImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const { prompt, numImages, imageSize, resolution, characterImageUrls, templateId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw new AppError(400, 'Prompt is required');
    }

    const uploadedImages = req.files as Express.Multer.File[] | undefined;

    // Normalize characterImageUrls to absolute URLs using request origin
    const origin = `${req.protocol}://${req.get('host')}`;
    let normalizedCharacterUrls: string[] = [];
    try {
      const raw = characterImageUrls ? (Array.isArray(characterImageUrls) ? characterImageUrls : JSON.parse(characterImageUrls)) : [];
      normalizedCharacterUrls = (raw as string[]).map((u) => (typeof u === 'string' && u.startsWith('http') ? u : `${origin}${u}`));
    } catch {
      normalizedCharacterUrls = [];
    }

    // Generate image synchronously with Google AI
    const result = await this.generateImageUseCase.execute({
      userId,
      prompt,
      numImages: numImages ? parseInt(numImages) : 1,
      imageSize,
      resolution,
      uploadedImages,
      characterImageUrls: normalizedCharacterUrls,
      templateId
    });

    // Return the generated image immediately
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  editImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const { prompt, numImages, imageSize, resolution, characterImageUrls, templateId } = req.body;
    const uploadedImages = req.files as Express.Multer.File[] | undefined;

    if (!prompt || typeof prompt !== 'string') {
      throw new AppError(400, 'Prompt is required');
    }

    if (!uploadedImages || uploadedImages.length === 0) {
      throw new AppError(400, 'At least one image is required for editing');
    }

    // Normalize characterImageUrls to absolute URLs using request origin
    const origin = `${req.protocol}://${req.get('host')}`;
    let normalizedCharacterUrls: string[] = [];
    try {
      const raw = characterImageUrls ? (Array.isArray(characterImageUrls) ? characterImageUrls : JSON.parse(characterImageUrls)) : [];
      normalizedCharacterUrls = (raw as string[]).map((u) => (typeof u === 'string' && u.startsWith('http') ? u : `${origin}${u}`));
    } catch {
      normalizedCharacterUrls = [];
    }

    // Edit image synchronously with Google AI
    const result = await this.editImageUseCase.execute({
      userId,
      prompt,
      numImages: numImages ? parseInt(numImages) : 1,
      imageSize,
      resolution,
      uploadedImages,
      characterImageUrls: normalizedCharacterUrls,
      templateId
    });

    // Return the edited image immediately
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Task status and callbacks are no longer needed with synchronous Google AI API

  getUserGeneratedImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    const images = await this.generatedImageRepository.findByUserId(userId, limit, skip);
    const total = await this.generatedImageRepository.countByUserId(userId);

    res.status(200).json({
      status: 'success',
      data: {
        images,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      }
    });
  });
}
