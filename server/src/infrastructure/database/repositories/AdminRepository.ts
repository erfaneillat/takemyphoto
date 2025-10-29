import { IAdminRepository } from '@core/domain/repositories/IAdminRepository';
import { Admin, CreateAdminDTO } from '@core/domain/entities/Admin';
import { AdminModel } from '../models/AdminModel';

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const admin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (!admin) return null;
    
    return this.mapToEntity(admin);
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = await AdminModel.findById(id);
    if (!admin) return null;
    
    return this.mapToEntity(admin);
  }

  async create(data: CreateAdminDTO): Promise<Admin> {
    const admin = await AdminModel.create({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
    });
    
    return this.mapToEntity(admin);
  }

  async updateLastLogin(id: string): Promise<void> {
    await AdminModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  private mapToEntity(doc: any): Admin {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastLoginAt: doc.lastLoginAt,
    };
  }
}
