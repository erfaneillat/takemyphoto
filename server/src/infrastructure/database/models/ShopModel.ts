import mongoose, { Schema, Document } from 'mongoose';
import { Shop, ShopType } from '@core/domain/entities/Shop';

export interface IShopDocument extends Omit<Shop, 'id'>, Document { }

const ShopSchema = new Schema<IShopDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        types: [{
            type: String,
            enum: Object.values(ShopType),
            required: true
        }],
        licenseDurationMonths: {
            type: Number,
            required: true,
            default: 1
        },
        licenseExpiresAt: {
            type: Date
        },
        licenseKey: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        isActivated: {
            type: Boolean,
            default: false
        },
        activatedAt: {
            type: Date
        },
        deviceFingerprint: {
            type: String,
            trim: true
        },
        logoWithBg: {
            type: String,
            trim: true
        },
        logoWithoutBg: {
            type: String,
            trim: true
        },
        generationCount: {
            type: Number,
            default: 0
        },
        credit: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
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

ShopSchema.index({ licenseKey: 1 }, { unique: true });

export const ShopModel = mongoose.model<IShopDocument>('Shop', ShopSchema);
