import { IUserRepository } from '@core/domain/repositories/IUserRepository';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<boolean> {
    const result = await this.userRepository.delete(userId);
    
    if (!result) {
      throw new Error('User not found or could not be deleted');
    }

    return result;
  }
}
