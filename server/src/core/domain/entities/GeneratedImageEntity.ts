export interface GeneratedImageEntity {
  id: string;
  userId: string;
  taskId?: string; // Optional - only for async APIs that use task tracking
  prompt: string;
  type: 'TEXTTOIAMGE' | 'IMAGETOIAMGE'; // generation or editing
  imageUrl?: string;
  originImageUrl?: string; // For image-to-image edits
  referenceImageUrls?: string[]; // Input images used
  characterIds?: string[]; // Characters used
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type CreateGeneratedImageDTO = Omit<GeneratedImageEntity, 'id' | 'createdAt'>;
