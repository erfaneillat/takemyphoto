export interface CharacterImage {
  id: string;
  url: string;
  publicId: string; // File path identifier
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
  images: CharacterImage[];
}

export interface UpdateCharacterDTO {
  name?: string;
  images?: CharacterImage[];
}
