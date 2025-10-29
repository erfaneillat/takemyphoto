export interface GenerationTask {
  id: string;
  taskId: string; // NanoBanana task ID
  userId: string;
  prompt: string;
  type: 'IMAGETOIAMGE' | 'TEXTTOIAMGE';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrls?: string[];
  referenceImageUrls?: string[];
  numImages: number;
  imageSize?: string;
  resultImageUrls?: string[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type CreateGenerationTaskDTO = Omit<GenerationTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;
