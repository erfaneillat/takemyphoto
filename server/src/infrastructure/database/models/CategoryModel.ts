import mongoose, { Schema, Document } from 'mongoose';
import { Category } from '@core/domain/entities/Category';

export interface ICategoryDocument extends Omit<Category, 'id'>, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
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
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1, order: 1 });

export const CategoryModel = mongoose.model<ICategoryDocument>('Category', CategorySchema);
