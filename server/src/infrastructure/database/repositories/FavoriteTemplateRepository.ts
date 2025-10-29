import { IFavoriteTemplateRepository } from '@core/domain/repositories/IFavoriteTemplateRepository';
import { FavoriteTemplate, CreateFavoriteTemplateDTO } from '@core/domain/entities/FavoriteTemplate';
import { FavoriteTemplateModel } from '../models/FavoriteTemplateModel';

export class FavoriteTemplateRepository implements IFavoriteTemplateRepository {
  async create(data: CreateFavoriteTemplateDTO): Promise<FavoriteTemplate> {
    const favorite = await FavoriteTemplateModel.create(data);
    return favorite.toJSON() as FavoriteTemplate;
  }

  async findByUserId(userId: string): Promise<FavoriteTemplate[]> {
    const favorites = await FavoriteTemplateModel.find({ userId }).sort({ createdAt: -1 });
    return favorites.map(fav => fav.toJSON() as FavoriteTemplate);
  }

  async findByUserAndTemplate(userId: string, templateId: string): Promise<FavoriteTemplate | null> {
    const favorite = await FavoriteTemplateModel.findOne({ userId, templateId });
    return favorite ? (favorite.toJSON() as FavoriteTemplate) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await FavoriteTemplateModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByUserAndTemplate(userId: string, templateId: string): Promise<boolean> {
    const result = await FavoriteTemplateModel.findOneAndDelete({ userId, templateId });
    return !!result;
  }

  async countByUserId(userId: string): Promise<number> {
    return await FavoriteTemplateModel.countDocuments({ userId });
  }
}
