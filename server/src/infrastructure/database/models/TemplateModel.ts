import mongoose, { Schema, Document } from 'mongoose';
import { Template } from '@core/domain/entities/Template';

export interface ITemplateDocument extends Omit<Template, 'id'>, Document {}

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    style: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true
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
TemplateSchema.index({ category: 1, createdAt: -1 });
TemplateSchema.index({ isTrending: 1, likeCount: -1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ prompt: 'text', tags: 'text' });

export const TemplateModel = mongoose.model<ITemplateDocument>('Template', TemplateSchema);
