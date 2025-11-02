import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersFilters {
  role?: string;
  subscription?: string;
  search?: string;
}

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  incrementStars(id: string, amount: number): Promise<User | null>;
  decrementStars(id: string, amount: number): Promise<User | null>;
  findAll(page: number, limit: number, filters?: GetUsersFilters): Promise<PaginatedUsers>;
  getStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    bySubscription: Record<string, number>;
    verified: number;
  }>;
}
