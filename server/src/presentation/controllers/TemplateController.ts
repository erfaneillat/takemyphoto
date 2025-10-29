import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GetTemplatesWithFavoritesUseCase } from '@application/usecases/template/GetTemplatesWithFavoritesUseCase';
import { ToggleFavoriteTemplateUseCase } from '@application/usecases/template/ToggleFavoriteTemplateUseCase';
import { GetUserFavoritesUseCase } from '@application/usecases/template/GetUserFavoritesUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class TemplateController {
  constructor(
    private getTemplatesWithFavoritesUseCase: GetTemplatesWithFavoritesUseCase,
    private toggleFavoriteTemplateUseCase: ToggleFavoriteTemplateUseCase,
    private getUserFavoritesUseCase: GetUserFavoritesUseCase
  ) {}

  getTemplates = asyncHandler(async (req: Request | AuthRequest, res: Response) => {
    const { category, search, trending, limit, offset } = req.query;
    const userId = (req as AuthRequest).user?.userId;

    const templates = await this.getTemplatesWithFavoritesUseCase.execute({
      category: category as string,
      search: search as string,
      trending: trending === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      userId
    });

    res.status(200).json({
      status: 'success',
      data: { templates }
    });
  });

  getUserFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const templates = await this.getUserFavoritesUseCase.execute(userId);

    res.status(200).json({
      status: 'success',
      data: { templates }
    });
  });

  toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { templateId } = req.params;
    const userId = req.user!.userId;

    const result = await this.toggleFavoriteTemplateUseCase.execute(userId, templateId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}
