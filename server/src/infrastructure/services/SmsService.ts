export interface ISmsService {
  sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
}

export class MockSmsService implements ISmsService {
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    console.log(`[SMS Service] Verification code for ${phoneNumber}: ${code}`);
    console.log(`[SMS Service] Code is valid for 10 minutes`);
    return Promise.resolve();
  }
}
