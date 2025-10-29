export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  parentId?: string; // For tracking edit history
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export type EditMode = 'generate' | 'edit' | 'brush';

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio?: string;
  quality?: string;
  style?: string;
}

export interface ImageEditParams {
  prompt: string;
  images: UploadedImage[];
  maskData?: string; // Base64 encoded mask image for brush tool
}
