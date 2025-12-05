import mongoose, { Schema, Document } from 'mongoose';
import { User, SubscriptionTier, UserRole } from '@core/domain/entities/User';

export interface IUserDocument extends Omit<User, 'id'>, Document { }

const UserSchema = new Schema<IUserDocument>(
  {
    phoneNumber: {
      type: String,
      trim: true
    },
    googleId: {
      type: String
    },
    name: {
      type: String,
      trim: true
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    profilePicture: {
      type: String,
      trim: true
    },
    subscription: {
      type: String,
      enum: Object.values(SubscriptionTier),
      default: SubscriptionTier.FREE
    },
    stars: {
      type: Number,
      default: 30,
      min: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
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
UserSchema.index(
  { phoneNumber: 1 },
  { unique: true, partialFilterExpression: { phoneNumber: { $exists: true, $ne: null } } }
);
UserSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $exists: true, $ne: null } } }
);
UserSchema.index({ email: 1 }, { sparse: true });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
