export interface Template {
  id: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  isFavorite: boolean;
  createdAt: Date;
}
