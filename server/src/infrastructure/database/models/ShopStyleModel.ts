import mongoose, { Schema, Document } from 'mongoose';
import { ShopStyle } from '@core/domain/entities/ShopStyle';
import { ShopType } from '@core/domain/entities/Shop';

export interface IShopStyleDocument extends Omit<ShopStyle, 'id'>, Document { }

const ShopStyleSchema = new Schema<IShopStyleDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
        prompt: {
            type: String,
            required: true
        },
        thumbnailUrl: {
            type: String,
            trim: true
        },
        types: [{
            type: String,
            enum: Object.values(ShopType),
            required: true
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

ShopStyleSchema.index({ slug: 1 });
ShopStyleSchema.index({ isActive: 1, order: 1 });
ShopStyleSchema.index({ types: 1 });

export const ShopStyleModel = mongoose.model<IShopStyleDocument>('ShopStyle', ShopStyleSchema);
