export interface Template {
  id: string;
  imageUrl: string;
  publicId: string;
  prompt: string;
  style?: string;
  category: string;
  tags: string[];
  isTrending: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDTO {
  imageUrl: string;
  publicId: string;
  prompt: string;
  style?: string;
  category: string;
  tags?: string[];
}

export interface UpdateTemplateDTO {
  prompt?: string;
  style?: string;
  category?: string;
  tags?: string[];
  isTrending?: boolean;
}
