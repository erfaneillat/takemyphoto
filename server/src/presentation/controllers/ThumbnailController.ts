import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GenerateThumbnailUseCase } from '@application/usecases/tools/GenerateThumbnailUseCase';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class ThumbnailController {
    constructor(
        private generateThumbnailUseCase: GenerateThumbnailUseCase
    ) { }

    generate = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { description, language, aspectRatio, visualDescription } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!description) {
            throw new AppError(400, 'Description is required');
        }

        if (!language) {
            throw new AppError(400, 'Language is required');
        }

        const result = await this.generateThumbnailUseCase.execute({
            description,
            language,
            images: files,
            aspectRatio,
            visualDescription
        });

        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}

