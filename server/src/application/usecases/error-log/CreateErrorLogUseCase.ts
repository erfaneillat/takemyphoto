import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';
import { ErrorLog, CreateErrorLogDTO } from '@core/domain/entities/ErrorLog';

export class CreateErrorLogUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(data: CreateErrorLogDTO): Promise<ErrorLog> {
    return await this.errorLogRepository.create(data);
  }
}
