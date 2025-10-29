import { IVerificationCodeRepository } from '@core/domain/repositories/IVerificationCodeRepository';
import { VerificationCode, CreateVerificationCodeDTO } from '@core/domain/entities/VerificationCode';
import { VerificationCodeModel } from '../models/VerificationCodeModel';

export class VerificationCodeRepository implements IVerificationCodeRepository {
  async create(data: CreateVerificationCodeDTO): Promise<VerificationCode> {
    const code = await VerificationCodeModel.create(data);
    return code.toJSON() as VerificationCode;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<VerificationCode | null> {
    const code = await VerificationCodeModel.findOne({ phoneNumber }).sort({ createdAt: -1 });
    return code ? (code.toJSON() as VerificationCode) : null;
  }

  async findValidCode(phoneNumber: string, code: string): Promise<VerificationCode | null> {
    const verificationCode = await VerificationCodeModel.findOne({
      phoneNumber,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    return verificationCode ? (verificationCode.toJSON() as VerificationCode) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await VerificationCodeModel.findByIdAndUpdate(id, { isUsed: true });
  }

  async incrementAttempts(id: string): Promise<void> {
    await VerificationCodeModel.findByIdAndUpdate(id, { $inc: { attempts: 1 } });
  }

  async deleteExpired(): Promise<void> {
    await VerificationCodeModel.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  async deleteByPhoneNumber(phoneNumber: string): Promise<void> {
    await VerificationCodeModel.deleteMany({ phoneNumber });
  }
}
