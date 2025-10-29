import mongoose, { Schema, Document } from 'mongoose';
import { FavoriteTemplate } from '@core/domain/entities/FavoriteTemplate';

export interface IFavoriteTemplateDocument extends Omit<FavoriteTemplate, 'id'>, Document {}

const FavoriteTemplateSchema = new Schema<IFavoriteTemplateDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    templateId: {
      type: String,
      required: true,
      index: true
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

// Compound index to ensure unique user-template pairs
FavoriteTemplateSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export const FavoriteTemplateModel = mongoose.model<IFavoriteTemplateDocument>(
  'FavoriteTemplate',
  FavoriteTemplateSchema
);
