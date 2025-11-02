import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { UpdateUserDTO } from '@core/domain/entities/User';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateUserDTO) {
    const user = await this.userRepository.update(userId, data);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
