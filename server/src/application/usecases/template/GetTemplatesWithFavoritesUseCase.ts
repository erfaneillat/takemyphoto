import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { IFavoriteTemplateRepository } from '@core/domain/repositories/IFavoriteTemplateRepository';
import { Template } from '@core/domain/entities/Template';

export interface GetTemplatesInput {
  category?: string;
  search?: string;
  trending?: boolean;
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface TemplateWithFavorite extends Template {
  isFavorite: boolean;
}

export class GetTemplatesWithFavoritesUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private favoriteTemplateRepository: IFavoriteTemplateRepository
  ) {}

  async execute(input: GetTemplatesInput): Promise<TemplateWithFavorite[]> {
    const { category, search, trending, limit = 50, offset = 0, userId } = input;

    // Fetch templates based on filters
    let templates: Template[];
    if (trending) {
      templates = await this.templateRepository.findTrending(limit);
    } else if (search) {
      templates = await this.templateRepository.search(search, limit, offset);
    } else if (category) {
      templates = await this.templateRepository.findByCategory(category, limit, offset);
    } else {
      templates = await this.templateRepository.findAll(limit, offset);
    }

    // If no user ID provided, return templates with isFavorite = false
    if (!userId) {
      return templates.map(template => ({
        ...template,
        isFavorite: false
      }));
    }

    // Get user's favorites
    const userFavorites = await this.favoriteTemplateRepository.findByUserId(userId);
    const favoriteTemplateIds = new Set(userFavorites.map(fav => fav.templateId));

    // Add isFavorite field to each template
    return templates.map(template => ({
      ...template,
      isFavorite: favoriteTemplateIds.has(template.id)
    }));
  }
}
