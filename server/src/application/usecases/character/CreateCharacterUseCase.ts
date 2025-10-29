import { ICharacterRepository } from '@core/domain/repositories/ICharacterRepository';
import { IFileUploadService } from '@infrastructure/services/FileUploadService';
import { Character, CharacterImage } from '@core/domain/entities/Character';

export interface CreateCharacterInput {
  userId: string;
  name: string;
  images: Express.Multer.File[];
}

export class CreateCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private fileUploadService: IFileUploadService
  ) {}

  async execute(input: CreateCharacterInput): Promise<Character> {
    const { userId, name, images } = input;

    // Validate image count
    if (images.length < 3 || images.length > 5) {
      throw new Error('Character must have between 3 and 5 images');
    }

    // Upload images to Cloudinary
    const uploadedFiles = await this.fileUploadService.uploadImages(images, `nero/characters/${userId}`);

    // Create character images array
    const characterImages: CharacterImage[] = uploadedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: file.url,
      publicId: file.publicId,
      order: index
    }));

    // Create character
    const character = await this.characterRepository.create({
      userId,
      name,
      images: characterImages
    } as any);

    return character;
  }
}
