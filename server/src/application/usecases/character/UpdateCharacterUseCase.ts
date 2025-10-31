import { ICharacterRepository } from '@core/domain/repositories/ICharacterRepository';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { Character, CharacterImage } from '@core/domain/entities/Character';

export interface UpdateCharacterInput {
  id: string;
  userId: string;
  name?: string;
  existingImages?: CharacterImage[];
  newImages?: Express.Multer.File[];
}

export class UpdateCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private fileUploadService: IFileUploadService
  ) {}

  async execute(input: UpdateCharacterInput): Promise<Character> {
    const { id, userId, name, existingImages, newImages } = input;

    const current = await this.characterRepository.findById(id);
    if (!current) {
      throw new Error('Character not found');
    }
    if (current.userId !== userId) {
      throw new Error('Not authorized to update this character');
    }

    let finalImages: CharacterImage[] = Array.isArray(existingImages) && existingImages.length > 0
      ? existingImages
      : current.images || [];

    if (newImages && newImages.length > 0) {
      const uploaded = await this.fileUploadService.uploadImages(newImages, `nero/characters/${userId}`);
      const startIndex = finalImages.length;
      const uploadedImages: CharacterImage[] = uploaded.map((file, idx) => ({
        id: `${Date.now()}-${startIndex + idx}`,
        url: file.url,
        publicId: file.publicId,
        order: startIndex + idx,
      }));
      finalImages = [...finalImages, ...uploadedImages];
    }

    if (finalImages.length < 3 || finalImages.length > 5) {
      throw new Error('Character must have between 3 and 5 images');
    }

    const payload: Partial<Character> = {};
    if (typeof name === 'string' && name.trim().length > 0) {
      payload.name = name.trim();
    }
    payload.images = finalImages;

    const updated = await this.characterRepository.update(id, payload);
    if (!updated) {
      throw new Error('Failed to update character');
    }
    return updated;
  }
}
