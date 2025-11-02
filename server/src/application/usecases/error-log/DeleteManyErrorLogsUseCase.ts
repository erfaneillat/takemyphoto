import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';

export class DeleteManyErrorLogsUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(ids: string[]): Promise<number> {
    return await this.errorLogRepository.deleteMany(ids);
  }
}
