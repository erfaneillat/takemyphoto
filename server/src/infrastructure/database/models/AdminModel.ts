import mongoose, { Schema, Document } from 'mongoose';
import { Admin } from '@core/domain/entities/Admin';

export interface AdminDocument extends Omit<Admin, 'id'>, Document {}

const AdminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
AdminSchema.index({ email: 1 });

export const AdminModel = mongoose.model<AdminDocument>('Admin', AdminSchema);
