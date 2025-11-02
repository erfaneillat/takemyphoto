import { IUserRepository, GetUsersFilters } from '@core/domain/repositories/IUserRepository';

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(page: number = 1, limit: number = 10, filters?: GetUsersFilters) {
    return await this.userRepository.findAll(page, limit, filters);
  }
}
