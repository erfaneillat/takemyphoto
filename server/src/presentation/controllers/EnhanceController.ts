import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UpscaleImageUseCase } from '@application/usecases/enhance/UpscaleImageUseCase';
import { ImageToPromptUseCase } from '@application/usecases/enhance/ImageToPromptUseCase';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class EnhanceController {
  constructor(
    private upscaleImageUseCase: UpscaleImageUseCase,
    private imageToPromptUseCase: ImageToPromptUseCase
  ) {}

  upscaleImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId || 'public';
    const image = req.file;
    const scale = parseInt(req.body.scale || '2');

    if (!image) {
      throw new AppError(400, 'No image file provided');
    }

    if (scale < 1 || scale > 4) {
      throw new AppError(400, 'Scale must be between 1 and 4');
    }

    const result = await this.upscaleImageUseCase.execute({
      imageFile: image,
      scale,
      userId
    });

    res.status(200).json({
      status: 'success',
      data: { upscaledImage: result }
    });
  });

  imageToPrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId || 'public';
    const image = req.file;

    if (!image) {
      throw new AppError(400, 'No image file provided');
    }

    const result = await this.imageToPromptUseCase.execute({
      imageFile: image,
      userId
    });

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}
