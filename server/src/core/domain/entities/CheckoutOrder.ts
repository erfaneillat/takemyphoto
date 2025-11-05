export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CheckoutOrder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  planId?: string;
  billingCycle?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutOrderDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  planId?: string;
  billingCycle?: string;
}

export interface UpdateCheckoutOrderDTO {
  status?: OrderStatus;
}
