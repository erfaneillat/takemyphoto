import mongoose, { Schema, Document } from 'mongoose';
import { Payment, PaymentStatus } from '@core/domain/entities/Payment';

export interface IPaymentDocument extends Omit<Payment, 'id'>, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: {
      type: String,
      required: true,
      ref: 'CheckoutOrder'
    },
    userId: {
      type: String,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    fromCurrencyCode: {
      type: Number,
      required: true,
      enum: [978, 364, 756, 784, 156, 826, 392, 643, 494] // Explicit currency codes
    },
    toCurrencyCode: {
      type: Number,
      required: true,
      enum: [978, 364, 756, 784, 156, 826, 392, 643, 494] // Explicit currency codes
    },
    authority: {
      type: String
    },
    reference: {
      type: String
    },
    gateway: {
      type: String
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    description: {
      type: String
    },
    errorMessage: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    collection: 'payments'
  }
);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ authority: 1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
