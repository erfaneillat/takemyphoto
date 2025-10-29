import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@core/domain/entities/Category';
import { CategoryModel } from '../models/CategoryModel';

export class CategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const category = await CategoryModel.create(data);
    return category.toJSON() as Category;
  }

  async findById(id: string): Promise<Category | null> {
    const category = await CategoryModel.findById(id);
    return category ? (category.toJSON() as Category) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await CategoryModel.findOne({ slug });
    return category ? (category.toJSON() as Category) : null;
  }

  async findAll(filters?: { isActive?: boolean }): Promise<Category[]> {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    const categories = await CategoryModel.find(query).sort({ order: 1, name: 1 });
    return categories.map(cat => cat.toJSON() as Category);
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category | null> {
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return category ? (category.toJSON() as Category) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async exists(slug: string, excludeId?: string): Promise<boolean> {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await CategoryModel.countDocuments(query);
    return count > 0;
  }
}
