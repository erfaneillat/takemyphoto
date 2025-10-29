import { VerificationCode, CreateVerificationCodeDTO } from '../entities/VerificationCode';

export interface IVerificationCodeRepository {
  create(data: CreateVerificationCodeDTO): Promise<VerificationCode>;
  findByPhoneNumber(phoneNumber: string): Promise<VerificationCode | null>;
  findValidCode(phoneNumber: string, code: string): Promise<VerificationCode | null>;
  markAsUsed(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteByPhoneNumber(phoneNumber: string): Promise<void>;
}
