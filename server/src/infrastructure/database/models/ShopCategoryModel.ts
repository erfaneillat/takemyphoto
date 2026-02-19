import mongoose, { Schema, Document } from 'mongoose';
import { ShopCategory } from '@core/domain/entities/ShopCategory';
import { ShopType } from '@core/domain/entities/Shop';

export interface IShopCategoryDocument extends Omit<ShopCategory, 'id'>, Document { }

const ShopCategorySchema = new Schema<IShopCategoryDocument>(
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
        types: [{
            type: String,
            enum: Object.values(ShopType),
            required: true
        }],
        sampleImages: [{
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }],
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

ShopCategorySchema.index({ slug: 1 });
ShopCategorySchema.index({ isActive: 1, order: 1 });
ShopCategorySchema.index({ types: 1 });

export const ShopCategoryModel = mongoose.model<IShopCategoryDocument>('ShopCategory', ShopCategorySchema);
