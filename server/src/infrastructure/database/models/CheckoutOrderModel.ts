import mongoose, { Schema, Document } from 'mongoose';
import { CheckoutOrder, OrderStatus } from '@core/domain/entities/CheckoutOrder';

export interface ICheckoutOrderDocument extends Omit<CheckoutOrder, 'id'>, Document {}

const CheckoutOrderSchema = new Schema<ICheckoutOrderDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    planId: {
      type: String,
      trim: true
    },
    billingCycle: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
CheckoutOrderSchema.index({ createdAt: -1 });
CheckoutOrderSchema.index({ status: 1 });
CheckoutOrderSchema.index({ email: 1 });
CheckoutOrderSchema.index({ phone: 1 });

export const CheckoutOrderModel = mongoose.model<ICheckoutOrderDocument>('CheckoutOrder', CheckoutOrderSchema);
