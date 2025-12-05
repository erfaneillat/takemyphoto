import axios from 'axios';

export interface ZarinpalRequestParams {
    merchantId: string;
    amount: number; // Amount in Rials
    description: string;
    callbackUrl: string;
    email?: string;
    mobile?: string;
}

export interface ZarinpalRequestResponse {
    data: {
        code: number;
        message: string;
        authority: string;
        fee_type: string;
        fee: number;
    };
    errors: any[];
}

export interface ZarinpalVerifyParams {
    merchantId: string;
    authority: string;
    amount: number;
}

export interface ZarinpalVerifyResponse {
    data: {
        code: number;
        message: string;
        card_hash: string;
        card_pan: string;
        ref_id: number;
        fee_type: string;
        fee: number;
    };
    errors: any[];
}

export class ZarinpalService {
    private merchantId: string;
    private baseUrl: string;
    private gatewayUrl: string;

    constructor(merchantId: string, isSandbox: boolean = false) {
        this.merchantId = merchantId;
        this.baseUrl = isSandbox
            ? 'https://sandbox.zarinpal.com/pg/v4/payment'
            : 'https://api.zarinpal.com/pg/v4/payment';
        this.gatewayUrl = isSandbox
            ? 'https://sandbox.zarinpal.com/pg/StartPay'
            : 'https://www.zarinpal.com/pg/StartPay';
    }

    /**
     * Create payment request
     */
    async requestPayment(params: Omit<ZarinpalRequestParams, 'merchantId'>): Promise<ZarinpalRequestResponse> {
        try {
            const url = `${this.baseUrl}/request.json`;

            const payload = {
                merchant_id: this.merchantId,
                amount: params.amount,
                description: params.description,
                callback_url: params.callbackUrl,
                metadata: {
                    email: params.email,
                    mobile: params.mobile
                }
            };

            console.log('Zarinpal Request:', { url, payload: { ...payload, merchant_id: '***' } });

            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Zarinpal Response:', response.data);

            return response.data;
        } catch (error: any) {
            console.error('Zarinpal request error:', error.response?.data || error.message);
            throw new Error(`Zarinpal request failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
        }
    }

    /**
     * Verify payment
     */
    async verifyPayment(authority: string, amount: number): Promise<ZarinpalVerifyResponse> {
        try {
            const url = `${this.baseUrl}/verify.json`;

            const payload = {
                merchant_id: this.merchantId,
                authority,
                amount
            };

            console.log('Zarinpal Verify:', { url, payload: { ...payload, merchant_id: '***' } });

            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Zarinpal Verify Response:', response.data);

            return response.data;
        } catch (error: any) {
            console.error('Zarinpal verify error:', error.response?.data || error.message);
            throw new Error(`Zarinpal verify failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
        }
    }

    /**
     * Get payment gateway URL
     */
    getPaymentUrl(authority: string): string {
        return `${this.gatewayUrl}/${authority}`;
    }

    /**
     * Get error description by code
     */
    getErrorDescription(code: number): string {
        const errors: Record<number, string> = {
            '-9': 'خطای اعتبار سنجی',
            '-10': 'آی پی یا مرچنت کد پذیرنده صحیح نیست',
            '-11': 'مرچنت کد فعال نیست',
            '-12': 'تلاش بیش از حد در یک بازه زمانی کوتاه',
            '-15': 'ترمینال شما به حالت تعلیق در آمده است',
            '-16': 'سطح تایید پذیرنده پایین تر از سطح نقره ای است',
            '-30': 'اجازه دسترسی به تسویه اشتراکی شناور ندارید',
            '-31': 'حساب بانکی تسویه را به پنل اضافه کنید',
            '-32': 'Wages is not valid, Total wages must be less than the amount',
            '-33': 'درصد های وارد شده صحیح نیست',
            '-34': 'مبلغ از کل تراکنش بیشتر است',
            '-35': 'تعداد افراد دریافت کننده تسهیم بیش از حد مجاز است',
            '-40': 'پارامترهای اضافی نامعتبر هستند',
            '-50': 'مبلغ پرداخت شده با مقدار مبلغ در وریفای متفاوت است',
            '-51': 'پرداخت ناموفق',
            '-52': 'خطای غیر منتظره با پشتیبانی تماس بگیرید',
            '-53': 'اتوریتی برای این مرچنت کد نیست',
            '-54': 'اتوریتی نامعتبر است',
            100: 'عملیات موفق',
            101: 'تراکنش قبلا وریفای شده است'
        };

        return errors[code] || 'خطای ناشناخته';
    }

    /**
     * Check if payment was successful
     */
    isSuccessCode(code: number): boolean {
        return code === 100 || code === 101;
    }
}
