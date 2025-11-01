import mongoose, { Schema, Document } from 'mongoose';
import { ContactMessage, ContactStatus } from '@core/domain/entities/ContactMessage';

export interface IContactMessageDocument extends Omit<ContactMessage, 'id'>, Document {}

const ContactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(ContactStatus),
      default: ContactStatus.UNREAD
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
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ email: 1 });

export const ContactMessageModel = mongoose.model<IContactMessageDocument>('ContactMessage', ContactMessageSchema);
