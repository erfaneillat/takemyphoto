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
  templateId?: string; // Template/style used for generation
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
  templateId?: string;
  metadata?: {
    aspectRatio?: string;
    quality?: string;
    style?: string;
    sourceImages?: string[];
  };
}
