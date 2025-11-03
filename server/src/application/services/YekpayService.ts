import axios from 'axios';
import { Currency } from '@core/domain/entities/Payment';

export interface YekpayRequestParams {
  merchantId: string;
  fromCurrencyCode: Currency;
  toCurrencyCode: Currency;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  country: string;
  city: string;
  description: string;
  amount: string; // Decimal format (15,2)
  orderNumber: string;
  callback: string;
}

export interface YekpayRequestResponse {
  Code: number;
  Description: string;
  Authority: string;
}

export interface YekpayVerifyParams {
  merchantId: string;
  authority: string;
}

export interface YekpayVerifyResponse {
  Code: number;
  Description: string;
  Reference?: string;
  Gateway?: string;
  OrderNo?: string;
  Amount?: number;
}

export class YekpayService {
  private merchantId: string;
  private isSandbox: boolean;
  private baseUrl: string;
  private gatewayUrl: string;

  constructor(merchantId: string, isSandbox: boolean = false) {
    this.merchantId = merchantId;
    this.isSandbox = isSandbox;
    this.baseUrl = isSandbox 
      ? 'https://api.ypsapi.com/api/sandbox'
      : 'https://gate.ypsapi.com/api/payment';
    this.gatewayUrl = isSandbox
      ? 'https://api.ypsapi.com/api/sandbox/payment'
      : 'https://gate.ypsapi.com/api/payment/start';
  }

  /**
   * Create payment request
   */
  async requestPayment(params: Omit<YekpayRequestParams, 'merchantId'>): Promise<YekpayRequestResponse> {
    try {
      const url = this.isSandbox 
        ? `${this.baseUrl}/request`
        : `${this.baseUrl}/request`;

      const payload = {
        merchantId: this.merchantId,
        ...params
      };

      console.log('Yekpay Request:', { url, payload });

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = typeof response.data === 'string' 
        ? JSON.parse(response.data)
        : response.data;

      console.log('Yekpay Response:', data);

      return {
        Code: data.Code,
        Description: data.Description,
        Authority: data.Authority || '0'
      };
    } catch (error: any) {
      console.error('Yekpay request error:', error.response?.data || error.message);
      throw new Error(`Yekpay request failed: ${error.response?.data?.Description || error.message}`);
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(authority: string): Promise<YekpayVerifyResponse> {
    try {
      const url = this.isSandbox
        ? `${this.baseUrl}/verify`
        : `${this.baseUrl}/verify`;

      const payload = {
        merchantId: this.merchantId,
        authority
      };

      console.log('Yekpay Verify:', { url, payload });

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data;

      console.log('Yekpay Verify Response:', data);

      return {
        Code: data.Code,
        Description: data.Description,
        Reference: data.Reference,
        Gateway: data.Gateway,
        OrderNo: data.OrderNo,
        Amount: data.Amount
      };
    } catch (error: any) {
      console.error('Yekpay verify error:', error.response?.data || error.message);
      throw new Error(`Yekpay verify failed: ${error.response?.data?.Description || error.message}`);
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
      '-1': 'The parameters are incomplete',
      '-2': 'Merchant code is incorrect',
      '-3': 'Merchant code is not active',
      '-4': 'Currencies is not valid',
      '-5': 'Maximum/Minimum amount is not valid',
      '-6': 'Your IP is restricted',
      '-7': 'Order id must be unique',
      '-8': 'Currencies is not valid',
      '-9': 'Maximum/Minimum amount is not valid',
      '-10': 'Your IP is restricted',
      '-100': 'Unknown error',
      '100': 'Success'
    };

    return errors[code] || 'Unknown error';
  }
}
