export interface ISmsService {
  sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
}

/**
 * Mock SMS service - logs verification codes to console
 * In production, replace with a real SMS provider (e.g., AWS SNS, Vonage, etc.)
 */
export class MockSmsService implements ISmsService {
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    console.log(`[SMS Service] Verification code for ${phoneNumber}: ${code}`);
    console.log(`[SMS Service] Code is valid for 10 minutes`);
    return Promise.resolve();
  }
}
