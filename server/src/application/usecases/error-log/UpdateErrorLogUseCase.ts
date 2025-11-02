import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';
import { ErrorLog, UpdateErrorLogDTO } from '@core/domain/entities/ErrorLog';

export class UpdateErrorLogUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(id: string, data: UpdateErrorLogDTO): Promise<ErrorLog | null> {
    return await this.errorLogRepository.update(id, data);
  }
}
