export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum Currency {
  EUR = 978,
  IRR = 364,
  CHF = 756,
  AED = 784,
  CNY = 156,
  GBP = 826,
  JPY = 392,
  RUB = 643,
  TRY = 494
}

export interface Payment {
  id: string;
  orderId: string; // Reference to CheckoutOrder
  userId?: string; // Optional user reference
  amount: number;
  fromCurrencyCode: Currency;
  toCurrencyCode: Currency;
  authority?: string; // Yekpay authority code
  reference?: string; // Payment reference from Yekpay
  gateway?: string; // Gateway used
  status: PaymentStatus;
  description?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  orderId: string;
  userId?: string;
  amount: number;
  fromCurrencyCode: Currency;
  toCurrencyCode: Currency;
  description?: string;
}

export interface UpdatePaymentDTO {
  authority?: string;
  reference?: string;
  gateway?: string;
  status?: PaymentStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
}
