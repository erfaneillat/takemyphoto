import { ICharacterRepository } from '@core/domain/repositories/ICharacterRepository';
import { IFileUploadService } from '@infrastructure/services/FileUploadService';

export class DeleteCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private fileUploadService: IFileUploadService
  ) {}

  async execute(characterId: string, userId: string): Promise<void> {
    // Find character
    const character = await this.characterRepository.findById(characterId);

    if (!character) {
      throw new Error('Character not found');
    }

    // Verify ownership
    if (character.userId !== userId) {
      throw new Error('Unauthorized to delete this character');
    }

    // Delete images from Cloudinary
    const publicIds = character.images.map(img => img.publicId);
    await this.fileUploadService.deleteImages(publicIds);

    // Delete character from database
    await this.characterRepository.delete(characterId);
  }
}
