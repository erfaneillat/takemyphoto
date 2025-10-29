import mongoose, { Schema, Document } from 'mongoose';
import { Character, CharacterImage } from '@core/domain/entities/Character';

export interface ICharacterDocument extends Omit<Character, 'id'>, Document {}

const CharacterImageSchema = new Schema<CharacterImage>(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    order: { type: Number, required: true, default: 0 }
  },
  { _id: false }
);

const CharacterSchema = new Schema<ICharacterDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [CharacterImageSchema],
      required: true,
      validate: {
        validator: (images: CharacterImage[]) => images.length >= 3 && images.length <= 5,
        message: 'Character must have between 3 and 5 images'
      }
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
CharacterSchema.index({ userId: 1, createdAt: -1 });

export const CharacterModel = mongoose.model<ICharacterDocument>('Character', CharacterSchema);
