import twilio from 'twilio';

export interface ISmsService {
  sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
}

export class TwilioSmsService implements ISmsService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Your Nero verification code is: ${code}. Valid for 10 minutes.`,
        from: this.fromNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error('Failed to send verification code');
    }
  }
}

// Mock SMS service for development
export class MockSmsService implements ISmsService {
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    console.log(`[MOCK SMS] Sending code ${code} to ${phoneNumber}`);
    // In development, just log the code
    return Promise.resolve();
  }
}
