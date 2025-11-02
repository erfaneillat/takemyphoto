import { IUserRepository } from '@core/domain/repositories/IUserRepository';

export class GetUserStatsUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    return await this.userRepository.getStats();
  }
}
