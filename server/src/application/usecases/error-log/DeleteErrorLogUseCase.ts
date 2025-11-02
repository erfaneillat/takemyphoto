import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';

export class DeleteErrorLogUseCase {
  constructor(private errorLogRepository: IErrorLogRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.errorLogRepository.delete(id);
  }
}
