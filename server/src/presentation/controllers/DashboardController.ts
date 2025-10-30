import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GetDashboardStatsUseCase } from '@application/usecases/dashboard/GetDashboardStatsUseCase';
import { GetGeneratedImagesUseCase } from '@application/usecases/dashboard/GetGeneratedImagesUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class DashboardController {
  constructor(
    private getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private getGeneratedImagesUseCase: GetGeneratedImagesUseCase
  ) {}

  getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const stats = await this.getDashboardStatsUseCase.execute();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  getGeneratedImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await this.getGeneratedImagesUseCase.execute(page, limit);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}
