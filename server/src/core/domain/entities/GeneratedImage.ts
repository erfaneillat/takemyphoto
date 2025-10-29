export enum ImageGenerationType {
  GENERATE = 'generate',
  EDIT = 'edit'
}

export interface GeneratedImage {
  id: string;
  userId: string;
  type: ImageGenerationType;
  prompt: string;
  imageUrl: string;
  publicId: string;
  parentId?: string; // For tracking edit history
  metadata: {
    aspectRatio?: string;
    quality?: string;
    style?: string;
    sourceImages?: string[]; // URLs of source images for edits
  };
  createdAt: Date;
}

export interface CreateGeneratedImageDTO {
  userId: string;
  type: ImageGenerationType;
  prompt: string;
  imageUrl: string;
  publicId: string;
  parentId?: string;
  metadata?: {
    aspectRatio?: string;
    quality?: string;
    style?: string;
    sourceImages?: string[];
  };
}
