import { FavoriteTemplate, CreateFavoriteTemplateDTO } from '../entities/FavoriteTemplate';

export interface IFavoriteTemplateRepository {
  create(data: CreateFavoriteTemplateDTO): Promise<FavoriteTemplate>;
  findByUserId(userId: string): Promise<FavoriteTemplate[]>;
  findByUserAndTemplate(userId: string, templateId: string): Promise<FavoriteTemplate | null>;
  delete(id: string): Promise<boolean>;
  deleteByUserAndTemplate(userId: string, templateId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}
