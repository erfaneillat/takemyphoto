import { ISmsService } from './SmsService';

interface KavenegarLookupResponse {
    return: {
        status: number;
        message: string;
    };
    entries: Array<{
        messageid: number;
        message: string;
        status: number;
        statustext: string;
        sender: string;
        receptor: string;
        date: number;
        cost: number;
    }>;
}

interface KavenegarErrorResponse {
    return: {
        status: number;
        message: string;
    };
}

interface AccountInfoResponse {
    return: {
        status: number;
        message: string;
    };
    entries?: {
        remaincredit: number;
    };
}

export class KavenegarService implements ISmsService {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.kavenegar.com/v1';
    private readonly templateName: string;

    constructor(apiKey?: string, templateName?: string) {
        this.apiKey = apiKey || process.env.KAVENEGAR_API_KEY || '';
        this.templateName = templateName || process.env.KAVENEGAR_OTP_TEMPLATE || 'verify';

        if (!this.apiKey) {
            console.warn('[KavenegarService] API key not configured. SMS sending will fail.');
        }
    }

    /**
     * Send OTP verification code using Kavenegar Lookup API (template-based)
     * This is the recommended method for OTP as it uses pre-approved templates
     */
    async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
        if (!this.apiKey) {
            console.error('[KavenegarService] API key not configured');
            throw new Error('SMS service not configured');
        }

        // Normalize phone number for Iran (remove leading 0, add 98 if needed)
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

        const url = `${this.baseUrl}/${this.apiKey}/verify/lookup.json`;

        const params = new URLSearchParams({
            receptor: normalizedPhone,
            token: code,
            template: this.templateName,
        });

        try {
            console.log(`[KavenegarService] Sending OTP to ${normalizedPhone} using template: ${this.templateName}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            const data = await response.json() as KavenegarLookupResponse | KavenegarErrorResponse;

            if (data.return.status !== 200) {
                console.error('[KavenegarService] API error:', {
                    status: data.return.status,
                    message: data.return.message,
                    phone: normalizedPhone,
                });
                throw new Error(`Kavenegar API error: ${data.return.message}`);
            }

            console.log('[KavenegarService] OTP sent successfully:', {
                phone: normalizedPhone,
                messageId: 'entries' in data ? data.entries[0]?.messageid : undefined,
            });
        } catch (error) {
            console.error('[KavenegarService] Failed to send OTP:', error);

            if (error instanceof Error && error.message.startsWith('Kavenegar API error')) {
                throw error;
            }

            throw new Error('Failed to send verification code. Please try again.');
        }
    }

    /**
     * Send custom SMS message (not template-based)
     * Use this for general messages, not recommended for OTP
     */
    async sendSms(phoneNumber: string, message: string): Promise<void> {
        if (!this.apiKey) {
            console.error('[KavenegarService] API key not configured');
            throw new Error('SMS service not configured');
        }

        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        const url = `${this.baseUrl}/${this.apiKey}/sms/send.json`;

        const params = new URLSearchParams({
            receptor: normalizedPhone,
            message: message,
        });

        try {
            console.log(`[KavenegarService] Sending SMS to ${normalizedPhone}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            const data = await response.json() as KavenegarLookupResponse | KavenegarErrorResponse;

            if (data.return.status !== 200) {
                console.error('[KavenegarService] API error:', {
                    status: data.return.status,
                    message: data.return.message,
                });
                throw new Error(`Kavenegar API error: ${data.return.message}`);
            }

            console.log('[KavenegarService] SMS sent successfully');
        } catch (error) {
            console.error('[KavenegarService] Failed to send SMS:', error);
            throw new Error('Failed to send SMS. Please try again.');
        }
    }

    /**
     * Normalize Iranian phone numbers to international format
     * Examples:
     *   09123456789 -> 989123456789
     *   9123456789  -> 989123456789
     *   +989123456789 -> 989123456789
     *   00989123456789 -> 989123456789
     */
    private normalizePhoneNumber(phone: string): string {
        // Remove all non-digit characters except leading +
        let cleaned = phone.replace(/[^\d+]/g, '');

        // Remove leading + or 00
        if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1);
        } else if (cleaned.startsWith('00')) {
            cleaned = cleaned.substring(2);
        }

        // If starts with 0, assume it's an Iranian number without country code
        if (cleaned.startsWith('0')) {
            cleaned = '98' + cleaned.substring(1);
        }

        // If it's 10 digits and starts with 9, add Iran country code
        if (cleaned.length === 10 && cleaned.startsWith('9')) {
            cleaned = '98' + cleaned;
        }

        return cleaned;
    }

    /**
     * Check account credit balance
     */
    async getCredit(): Promise<number> {
        if (!this.apiKey) {
            throw new Error('SMS service not configured');
        }

        const url = `${this.baseUrl}/${this.apiKey}/account/info.json`;

        try {
            const response = await fetch(url);
            const data = await response.json() as AccountInfoResponse;

            if (data.return.status !== 200) {
                throw new Error(`Kavenegar API error: ${data.return.message}`);
            }

            return data.entries?.remaincredit || 0;
        } catch (error) {
            console.error('[KavenegarService] Failed to get credit:', error);
            throw error;
        }
    }
}
