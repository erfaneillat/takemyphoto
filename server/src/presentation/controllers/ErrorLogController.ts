import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { GetErrorLogsUseCase } from '@application/usecases/error-log/GetErrorLogsUseCase';
import { GetErrorLogStatsUseCase } from '@application/usecases/error-log/GetErrorLogStatsUseCase';
import { UpdateErrorLogUseCase } from '@application/usecases/error-log/UpdateErrorLogUseCase';
import { DeleteErrorLogUseCase } from '@application/usecases/error-log/DeleteErrorLogUseCase';
import { DeleteManyErrorLogsUseCase } from '@application/usecases/error-log/DeleteManyErrorLogsUseCase';

export class ErrorLogController {
  constructor(
    private getErrorLogsUseCase: GetErrorLogsUseCase,
    private getErrorLogStatsUseCase: GetErrorLogStatsUseCase,
    private updateErrorLogUseCase: UpdateErrorLogUseCase,
    private deleteErrorLogUseCase: DeleteErrorLogUseCase,
    private deleteManyErrorLogsUseCase: DeleteManyErrorLogsUseCase
  ) {}

  getErrorLogs = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Filters
    const filters: any = {};
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.severity) filters.severity = req.query.severity as string;
    if (req.query.resolved !== undefined) filters.resolved = req.query.resolved === 'true';
    if (req.query.userId) filters.userId = req.query.userId as string;

    const result = await this.getErrorLogsUseCase.execute(page, limit, filters);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  getErrorLogStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.getErrorLogStatsUseCase.execute();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  updateErrorLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { resolved, notes } = req.body;

    const updateData: any = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (notes !== undefined) updateData.notes = notes;
    
    // Add admin ID from authenticated user
    if (resolved && (req as any).user?.id) {
      updateData.resolvedBy = (req as any).user.id;
    }

    const updated = await this.updateErrorLogUseCase.execute(id, updateData);

    if (!updated) {
      res.status(404).json({
        status: 'error',
        message: 'Error log not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updated
    });
  });

  deleteErrorLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleted = await this.deleteErrorLogUseCase.execute(id);

    if (!deleted) {
      res.status(404).json({
        status: 'error',
        message: 'Error log not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Error log deleted successfully'
    });
  });

  deleteManyErrorLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid or empty ids array'
      });
      return;
    }

    const deletedCount = await this.deleteManyErrorLogsUseCase.execute(ids);

    res.status(200).json({
      status: 'success',
      message: `Successfully deleted ${deletedCount} error log(s)`,
      data: { deletedCount }
    });
  });
}
