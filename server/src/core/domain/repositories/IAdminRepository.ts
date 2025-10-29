import { Admin, CreateAdminDTO } from '../entities/Admin';

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  create(data: CreateAdminDTO): Promise<Admin>;
  updateLastLogin(id: string): Promise<void>;
}
