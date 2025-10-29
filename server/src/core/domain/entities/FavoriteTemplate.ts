export interface FavoriteTemplate {
  id: string;
  userId: string;
  templateId: string;
  createdAt: Date;
}

export interface CreateFavoriteTemplateDTO {
  userId: string;
  templateId: string;
}
