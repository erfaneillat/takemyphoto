import { IFavoriteTemplateRepository } from '@core/domain/repositories/IFavoriteTemplateRepository';
import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { Template } from '@core/domain/entities/Template';

export class GetUserFavoritesUseCase {
  constructor(
    private favoriteTemplateRepository: IFavoriteTemplateRepository,
    private templateRepository: ITemplateRepository
  ) {}

  async execute(userId: string): Promise<Template[]> {
    // Get all favorite template IDs for the user
    const favorites = await this.favoriteTemplateRepository.findByUserId(userId);
    
    if (favorites.length === 0) {
      return [];
    }

    // Get template IDs
    const templateIds = favorites.map(fav => fav.templateId);

    // Fetch all templates
    const templates = await this.templateRepository.findByIds(templateIds);

    // Sort by favorite creation date (most recent first)
    const favoriteMap = new Map(favorites.map(fav => [fav.templateId, fav.createdAt]));
    templates.sort((a: Template, b: Template) => {
      const dateA = favoriteMap.get(a.id) || new Date(0);
      const dateB = favoriteMap.get(b.id) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return templates;
  }
}
