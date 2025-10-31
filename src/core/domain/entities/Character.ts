export interface CharacterImage {
  id: string;
  url: string;
  publicId?: string;
  order?: number;
  file?: File;
  preview?: string;
}

export interface Character {
  id: string;
  name: string;
  images: CharacterImage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface CreateCharacterData {
  name: string;
  images: File[];
}

export interface UpdateCharacterData {
  id: string;
  name?: string;
  images?: CharacterImage[];
}
