import { IUserRepository } from '@core/domain/repositories/IUserRepository';
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
}
