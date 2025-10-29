import mongoose, { Schema, Document } from 'mongoose';
import { VerificationCode } from '@core/domain/entities/VerificationCode';

export interface IVerificationCodeDocument extends Omit<VerificationCode, 'id'>, Document {}

const VerificationCodeSchema = new Schema<IVerificationCodeDocument>(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// TTL index to automatically delete expired codes
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCodeModel = mongoose.model<IVerificationCodeDocument>(
  'VerificationCode',
  VerificationCodeSchema
);
