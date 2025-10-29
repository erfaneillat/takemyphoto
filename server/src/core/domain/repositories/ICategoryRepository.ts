import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/Category';

export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Category[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
  exists(slug: string, excludeId?: string): Promise<boolean>;
}
