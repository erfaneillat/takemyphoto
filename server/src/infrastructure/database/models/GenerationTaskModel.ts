import mongoose, { Schema, Document } from 'mongoose';
import { GenerationTask } from '@core/domain/entities/GenerationTask';

export interface GenerationTaskDocument extends Omit<GenerationTask, 'id'>, Document {}

const GenerationTaskSchema = new Schema<GenerationTaskDocument>(
  {
    taskId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    prompt: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['IMAGETOIAMGE', 'TEXTTOIAMGE'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending',
      index: true 
    },
    imageUrls: [{ type: String }],
    referenceImageUrls: [{ type: String }],
    numImages: { 
      type: Number, 
      default: 1 
    },
    imageSize: { type: String },
    resultImageUrls: [{ type: String }],
    error: { type: String },
    completedAt: { type: Date }
  },
  {
    timestamps: true,
    collection: 'generation_tasks'
  }
);

// Indexes for efficient queries
GenerationTaskSchema.index({ userId: 1, createdAt: -1 });
GenerationTaskSchema.index({ taskId: 1 });

export const GenerationTaskModel = mongoose.model<GenerationTaskDocument>(
  'GenerationTask',
  GenerationTaskSchema
);
