import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GetTemplatesWithFavoritesUseCase } from '@application/usecases/template/GetTemplatesWithFavoritesUseCase';
import { ToggleFavoriteTemplateUseCase } from '@application/usecases/template/ToggleFavoriteTemplateUseCase';
import { GetUserFavoritesUseCase } from '@application/usecases/template/GetUserFavoritesUseCase';
import { GetPopularStylesUseCase } from '@application/usecases/template/GetPopularStylesUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class TemplateController {
  constructor(
    private getTemplatesWithFavoritesUseCase: GetTemplatesWithFavoritesUseCase,
    private toggleFavoriteTemplateUseCase: ToggleFavoriteTemplateUseCase,
    private getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private getPopularStylesUseCase: GetPopularStylesUseCase
  ) {}

  getTemplates = asyncHandler(async (req: Request | AuthRequest, res: Response) => {
    const { category, search, trending, trendingPeriod, limit, offset } = req.query;
    const userId = (req as AuthRequest).user?.userId;

    const templates = await this.getTemplatesWithFavoritesUseCase.execute({
      category: category as string,
      search: search as string,
      trending: trending === 'true',
      trendingPeriod: (trendingPeriod as 'week' | 'month') || 'week',
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

  getPopularStyles = asyncHandler(async (req: Request, res: Response) => {
    const { limit, period, offset, category } = req.query;

    const templates = await this.getPopularStylesUseCase.execute({
      limit: limit ? parseInt(limit as string) : 10,
      period: (period as 'all' | 'month' | 'week') || 'all',
      offset: offset ? parseInt(offset as string) : 0,
      category: category ? String(category) : undefined
    });

    res.status(200).json({
      status: 'success',
      data: { templates }
    });
  });
}
