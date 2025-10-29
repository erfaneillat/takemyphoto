import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { IGeneratedImageRepository } from '@core/domain/repositories/IGeneratedImageRepository';
import { IFavoriteTemplateRepository } from '@core/domain/repositories/IFavoriteTemplateRepository';
import { User } from '@core/domain/entities/User';

export interface UserProfileStats {
  totalEdits: number;
  editsThisMonth: number;
  favoriteCount: number;
}

export interface UserProfileResult {
  user: User;
  stats: UserProfileStats;
}

export class GetUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private generatedImageRepository: IGeneratedImageRepository,
    private favoriteTemplateRepository: IFavoriteTemplateRepository
  ) {}

  async execute(userId: string): Promise<UserProfileResult> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const [totalEdits, editsThisMonth, favoriteCount] = await Promise.all([
      this.generatedImageRepository.countByUserId(userId),
      this.generatedImageRepository.countByUserIdThisMonth(userId),
      this.favoriteTemplateRepository.countByUserId(userId)
    ]);

    return {
      user,
      stats: {
        totalEdits,
        editsThisMonth,
        favoriteCount
      }
    };
  }
}
