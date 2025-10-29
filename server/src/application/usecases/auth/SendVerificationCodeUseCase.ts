import { IVerificationCodeRepository } from '@core/domain/repositories/IVerificationCodeRepository';
import { ISmsService } from '@infrastructure/services/SmsService';

export class SendVerificationCodeUseCase {
  constructor(
    private verificationCodeRepository: IVerificationCodeRepository,
    private smsService: ISmsService
  ) {}

  async execute(phoneNumber: string): Promise<void> {
    // Delete any existing codes for this phone number
    await this.verificationCodeRepository.deleteByPhoneNumber(phoneNumber);

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save the verification code
    await this.verificationCodeRepository.create({
      phoneNumber,
      code,
      expiresAt
    });

    // Send SMS
    await this.smsService.sendVerificationCode(phoneNumber, code);
  }
}
