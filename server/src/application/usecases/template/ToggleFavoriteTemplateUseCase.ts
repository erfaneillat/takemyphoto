import { IFavoriteTemplateRepository } from '@core/domain/repositories/IFavoriteTemplateRepository';
import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';

export class ToggleFavoriteTemplateUseCase {
  constructor(
    private favoriteTemplateRepository: IFavoriteTemplateRepository,
    private templateRepository: ITemplateRepository
  ) {}

  async execute(userId: string, templateId: string): Promise<{ isFavorite: boolean }> {
    // Check if template exists
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteTemplateRepository.findByUserAndTemplate(
      userId,
      templateId
    );

    if (existingFavorite) {
      // Remove from favorites
      await this.favoriteTemplateRepository.delete(existingFavorite.id);
      await this.templateRepository.decrementLikeCount(templateId);
      return { isFavorite: false };
    } else {
      // Add to favorites
      await this.favoriteTemplateRepository.create({ userId, templateId });
      await this.templateRepository.incrementLikeCount(templateId);
      return { isFavorite: true };
    }
  }
}
