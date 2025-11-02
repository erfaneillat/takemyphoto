import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';
import { ErrorLog } from '@core/domain/entities/ErrorLog';

export class GetErrorLogsUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      severity?: string;
      resolved?: boolean;
      userId?: string;
    }
  ): Promise<{ logs: ErrorLog[]; total: number; page: number; totalPages: number }> {
    const result = await this.errorLogRepository.findAll(page, limit, filters);
    return {
      ...result,
      page,
      totalPages: Math.ceil(result.total / limit)
    };
  }
}
