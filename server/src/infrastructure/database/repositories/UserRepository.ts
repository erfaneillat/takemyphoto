import { IUserRepository, PaginatedUsers, GetUsersFilters } from '@core/domain/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '@core/domain/entities/User';
import { UserModel } from '../models/UserModel';

export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const user = await UserModel.create(data);
    return user.toJSON() as User;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? (user.toJSON() as User) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await UserModel.findOne({ phoneNumber });
    return user ? (user.toJSON() as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? (user.toJSON() as User) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await UserModel.findOne({ googleId });
    return user ? (user.toJSON() as User) : null;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    return user ? (user.toJSON() as User) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async incrementStars(id: string, amount: number): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { stars: amount } },
      { new: true }
    );
    return user ? (user.toJSON() as User) : null;
  }

  async decrementStars(id: string, amount: number): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { stars: -amount } },
      { new: true }
    );
    return user ? (user.toJSON() as User) : null;
  }

  async findAll(page: number, limit: number, filters?: GetUsersFilters): Promise<PaginatedUsers> {
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.subscription) {
      query.subscription = filters.subscription;
    }

    if (filters?.loginType === 'phone') {
      query.phoneNumber = { $exists: true, $ne: null };
      query.googleId = { $exists: false };
    } else if (filters?.loginType === 'google') {
      query.googleId = { $exists: true, $ne: null };
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);

    return {
      users: users as User[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    bySubscription: Record<string, number>;
    verified: number;
    phoneUsers: number;
    googleUsers: number;
  }> {
    const [total, byRole, bySubscription, verified, phoneUsers, googleUsers] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      UserModel.aggregate([
        { $group: { _id: '$subscription', count: { $sum: 1 } } }
      ]),
      UserModel.countDocuments({ isVerified: true }),
      UserModel.countDocuments({ phoneNumber: { $exists: true, $ne: null }, googleId: { $exists: false } }),
      UserModel.countDocuments({ googleId: { $exists: true, $ne: null } })
    ]);

    const roleStats: Record<string, number> = {};
    byRole.forEach((item: any) => {
      roleStats[item._id] = item.count;
    });

    const subscriptionStats: Record<string, number> = {};
    bySubscription.forEach((item: any) => {
      subscriptionStats[item._id] = item.count;
    });

    return {
      total,
      byRole: roleStats,
      bySubscription: subscriptionStats,
      verified,
      phoneUsers,
      googleUsers
    };
  }
}
