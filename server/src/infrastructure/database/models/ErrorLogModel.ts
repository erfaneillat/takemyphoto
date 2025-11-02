import mongoose, { Schema, Document } from 'mongoose';
import { ErrorLog, ErrorSeverity, ErrorType } from '@core/domain/entities/ErrorLog';

export interface IErrorLogDocument extends Omit<ErrorLog, 'id'>, Document {}

const ErrorLogSchema = new Schema<IErrorLogDocument>(
  {
    type: {
      type: String,
      enum: Object.values(ErrorType),
      required: true
    },
    severity: {
      type: String,
      enum: Object.values(ErrorSeverity),
      required: true
    },
    message: {
      type: String,
      required: true
    },
    stack: {
      type: String
    },
    endpoint: {
      type: String
    },
    method: {
      type: String
    },
    userId: {
      type: String
    },
    statusCode: {
      type: Number
    },
    requestBody: {
      type: Schema.Types.Mixed
    },
    requestParams: {
      type: Schema.Types.Mixed
    },
    requestQuery: {
      type: Schema.Types.Mixed
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: String
    },
    notes: {
      type: String
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
ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ severity: 1 });
ErrorLogSchema.index({ type: 1 });
ErrorLogSchema.index({ resolved: 1 });
ErrorLogSchema.index({ userId: 1 });
ErrorLogSchema.index({ endpoint: 1 });

export const ErrorLogModel = mongoose.model<IErrorLogDocument>('ErrorLog', ErrorLogSchema);
