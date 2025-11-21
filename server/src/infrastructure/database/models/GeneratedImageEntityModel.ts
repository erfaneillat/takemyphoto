import mongoose, { Schema, Document } from 'mongoose';
import { GeneratedImageEntity } from '@core/domain/entities/GeneratedImageEntity';

export interface GeneratedImageEntityDocument extends Omit<GeneratedImageEntity, 'id'>, Document { }

const GeneratedImageEntitySchema = new Schema<GeneratedImageEntityDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    taskId: {
      type: String,
      required: false
    },
    prompt: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['TEXTTOIAMGE', 'IMAGETOIAMGE', 'THUMBNAIL'],
      required: true
    },
    imageUrl: {
      type: String
    },
    originImageUrl: {
      type: String
    },
    referenceImageUrls: [{
      type: String
    }],
    characterIds: [{
      type: String
    }],
    templateId: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    error: {
      type: String
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'generated_images'
  }
);

// Indexes for efficient queries
GeneratedImageEntitySchema.index({ userId: 1, createdAt: -1 });
GeneratedImageEntitySchema.index({ userId: 1, status: 1 });
// Unique index on taskId ONLY when it's a non-null string (excludes null/undefined)
GeneratedImageEntitySchema.index(
  { taskId: 1 },
  { unique: true, partialFilterExpression: { taskId: { $type: 'string' } } }
);

export const GeneratedImageEntityModel = mongoose.model<GeneratedImageEntityDocument>(
  'GeneratedImageEntity',
  GeneratedImageEntitySchema
);
