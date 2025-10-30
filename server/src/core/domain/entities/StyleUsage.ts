export interface StyleUsage {
  id: string;
  templateId: string;
  userId: string;
  generatedImageId: string;
  createdAt: Date;
}

export interface CreateStyleUsageDTO {
  templateId: string;
  userId: string;
  generatedImageId: string;
}

export interface StyleUsageStats {
  templateId: string;
  templateName?: string;
  templateImageUrl?: string;
  usageCount: number;
  lastUsedAt: Date;
}
