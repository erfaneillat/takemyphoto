import mongoose, { Schema, Document } from 'mongoose';
import { StyleUsage } from '@core/domain/entities/StyleUsage';

export interface IStyleUsageDocument extends Omit<StyleUsage, 'id'>, Document {}

const StyleUsageSchema = new Schema<IStyleUsageDocument>(
  {
    templateId: { 
      type: String, 
      required: true,
      index: true
    },
    userId: { 
      type: String, 
      required: true,
      index: true
    },
    generatedImageId: { 
      type: String, 
      required: true
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
StyleUsageSchema.index({ templateId: 1, createdAt: -1 });
StyleUsageSchema.index({ userId: 1, createdAt: -1 });

export const StyleUsageModel = mongoose.model<IStyleUsageDocument>('StyleUsage', StyleUsageSchema);
