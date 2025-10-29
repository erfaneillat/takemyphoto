export interface CharacterImage {
  id: string;
  url: string;
  publicId: string; // Cloudinary public ID
  order: number;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  images: CharacterImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterDTO {
  userId: string;
  name: string;
  images: Express.Multer.File[];
}

export interface UpdateCharacterDTO {
  name?: string;
  images?: CharacterImage[];
}
