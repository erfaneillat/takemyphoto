import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';

export class GetErrorLogStatsUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    unresolved: number;
  }> {
    return await this.errorLogRepository.getStats();
  }
}
