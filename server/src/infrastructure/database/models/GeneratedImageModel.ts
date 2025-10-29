import mongoose, { Schema, Document } from 'mongoose';
import { GeneratedImage, ImageGenerationType } from '@core/domain/entities/GeneratedImage';

export interface IGeneratedImageDocument extends Omit<GeneratedImage, 'id'>, Document {}

const GeneratedImageSchema = new Schema<IGeneratedImageDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(ImageGenerationType),
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    parentId: {
      type: String,
      index: true
    },
    metadata: {
      aspectRatio: String,
      quality: String,
      style: String,
      sourceImages: [String]
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

// Indexes
GeneratedImageSchema.index({ userId: 1, createdAt: -1 });
GeneratedImageSchema.index({ parentId: 1 });

export const GeneratedImageModel = mongoose.model<IGeneratedImageDocument>(
  'GeneratedImage',
  GeneratedImageSchema
);
